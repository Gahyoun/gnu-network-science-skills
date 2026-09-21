"""statphys-pre 헬퍼: Monte Carlo 오차 산정과 finite-size scaling collapse.

모든 함수는 sp_ 접두사를 쓴다. 상세 사용법은 SKILL.md의 §헬퍼와
references/수치방법-MC-FSS.md의 "FSS 실행 절차"를 참조.
"""

import numpy as np


def sp_int_autocorr(x, c=6.0):
    """적분 자기상관시간 tau_int = 1/2 + sum_t rho(t), Sokal 자동 윈도우.

    반환: (tau_int, tau_err, window). tau_err는 Madras-Sokal 추정.
    c는 윈도우 상수(지수적 감쇠면 6 정도가 표준; 꼬리가 길면 8~10).
    """
    x = np.asarray(x, dtype=float).ravel()
    n = x.size
    if n < 16:
        raise ValueError("표본이 너무 짧습니다 (n >= 16 필요)")
    xm = x - x.mean()
    nfft = 1 << (2 * n - 1).bit_length()
    f = np.fft.rfft(xm, nfft)
    acf = np.fft.irfft(f * np.conjugate(f), nfft)[:n].real
    if acf[0] <= 0:
        return 0.5, 0.0, 0
    acf = acf / acf[0]
    taus = 0.5 + np.cumsum(acf[1:])
    window = taus.size
    for w in range(1, taus.size + 1):
        if w >= c * taus[w - 1]:
            window = w
            break
    tau = float(max(taus[window - 1], 0.5))
    err = tau * np.sqrt(2.0 * (2 * window + 1) / n)
    return tau, float(err), int(window)


def sp_mc_error(x, c=6.0):
    """상관 보정된 평균과 표준오차. 반환: (mean, err, n_eff).

    err = sqrt(2 * tau_int * Var / N). naive sigma/sqrt(N)를 쓰지 말 것.
    """
    x = np.asarray(x, dtype=float).ravel()
    tau = sp_int_autocorr(x, c)[0]
    n = x.size
    err = np.sqrt(2.0 * tau * x.var(ddof=1) / n)
    return float(x.mean()), float(err), float(n / (2.0 * tau))


def sp_jackknife(x, func, nblocks=20):
    """블록 jackknife. 비선형 추정량(chi, Binder, 지수 비)의 오차는 이쪽으로.

    x: (N, ...) 배열, 첫 축이 표본. func: 배열 -> 스칼라.
    블록 길이가 2*tau_int보다 충분히 길도록 nblocks를 정한다.
    반환: (bias-corrected value, err).
    """
    x = np.asarray(x)
    n = x.shape[0]
    nb = int(min(nblocks, n))
    if nb < 2:
        raise ValueError("nblocks >= 2 필요")
    full = float(func(x))
    vals = np.empty(nb)
    for i, idx in enumerate(np.array_split(np.arange(n), nb)):
        keep = np.ones(n, dtype=bool)
        keep[idx] = False
        vals[i] = float(func(x[keep]))
    est = nb * full - (nb - 1) * vals.mean()
    err = np.sqrt((nb - 1) / nb * np.sum((vals - vals.mean()) ** 2))
    return float(est), float(err)


def sp_binder(m):
    """Binder cumulant U4 = 1 - <m^4>/(3<m^2>^2). 오차는 sp_jackknife로 감쌀 것."""
    m = np.abs(np.asarray(m, dtype=float).ravel())
    m2 = np.mean(m ** 2)
    if m2 == 0:
        return float("nan")
    return float(1.0 - np.mean(m ** 4) / (3.0 * m2 * m2))


def sp_collapse_quality(sizes, xs, ys, dys, xc, nu, zeta):
    """Bhattacharjee-Seno collapse 품질 S.

    스케일 변수: X = (x - xc) * L**(1/nu), Y = y * L**zeta.
      order parameter m이면 zeta = +beta/nu, susceptibility면 zeta = -gamma/nu.
    dys(오차)를 주면 S ~ 1이 "오차 수준에서 collapse 성립"을 뜻한다.
    dys=None이면 가중치 1의 평균제곱잔차로, 상대 비교에만 쓴다.
    """
    L = [float(s) for s in sizes]
    ns = len(L)
    if nu <= 0:
        return 1e30
    X, Y, D = [], [], []
    for j in range(ns):
        xj = np.asarray(xs[j], dtype=float).ravel()
        yj = np.asarray(ys[j], dtype=float).ravel()
        dj = np.ones_like(yj) if dys is None else np.asarray(dys[j], dtype=float).ravel()
        o = np.argsort((xj - xc) * L[j] ** (1.0 / nu))
        X.append(((xj - xc) * L[j] ** (1.0 / nu))[o])
        Y.append((yj * L[j] ** zeta)[o])
        D.append(np.maximum(np.abs(dj[o] * L[j] ** zeta), 1e-12))
    num, cnt = 0.0, 0
    for j in range(ns):
        for i in range(X[j].size):
            est, err = [], []
            for k in range(ns):
                if k == j or X[k].size < 2:
                    continue
                if X[j][i] < X[k][0] or X[j][i] > X[k][-1]:
                    continue
                est.append(np.interp(X[j][i], X[k], Y[k]))
                err.append(np.interp(X[j][i], X[k], D[k]))
            if not est:
                continue
            ybar, dbar = float(np.mean(est)), float(np.mean(err))
            num += (Y[j][i] - ybar) ** 2 / (D[j][i] ** 2 + dbar ** 2)
            cnt += 1
    if cnt == 0:
        return float("nan")
    return float(num / cnt)


def sp_fit_collapse(sizes, xs, ys, dys=None, p0=None):
    """(xc, nu, zeta)를 동시에 추정해 collapse 품질 S를 최소화한다.

    p0 = (xc0, nu0, zeta0) 초기값 필수. 반환: ((xc, nu, zeta), S_min).
    오차는 여기서 나오지 않는다 — 독립 실행 bootstrap으로 이 함수를 반복 호출해 낸다.
    """
    from scipy.optimize import minimize

    if p0 is None:
        raise ValueError("p0=(xc, nu, zeta) 초기값이 필요합니다")

    def objective(p):
        return sp_collapse_quality(sizes, xs, ys, dys, p[0], p[1], p[2])

    res = minimize(objective, np.asarray(p0, dtype=float), method="Nelder-Mead",
                   options={"xatol": 1e-6, "fatol": 1e-8, "maxiter": 5000})
    return (float(res.x[0]), float(res.x[1]), float(res.x[2])), float(res.fun)
