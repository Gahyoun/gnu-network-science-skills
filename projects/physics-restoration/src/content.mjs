// The original eight-page sequence is retained. Explanations and exercises are
// independently phrased; original prose, artwork and decompiled code are not distributed.
const p = text => ({type: 'p', text});
const eq = (tex, label) => ({type: 'equation', tex, label});
const w = (id, title, caption) => ({type: 'widget', id, title, caption});
const questions = (...items) => ({type: 'questions', items});
const note = text => ({type: 'note', text});
const s = (id, title, ...blocks) => ({id, title, blocks});
const raw = String.raw;
export const pages = [
 {file: 'quantum-statistics.html', title: '양자통계', subtitle: '고전 분포함수', group: '양자통계', source: 'qdistribute/qdistribute.html', sections: [
  s('introduction', '양자통계',
   p('통계역학은 거시상태에 대응하는 미시상태의 수를 통해 확률을 계산한다. 양자역학에서는 상태가 구별되므로 상태를 세는 기준이 자연스럽게 주어진다.'),
   p('동일한 입자는 서로 식별할 수 없다. 보손과 페르미온의 차이는 한 상태에 허용되는 점유수와 전체 파동함수의 대칭성에 있다. 이 조건을 통계역학에 반영한 것이 양자통계다.')),
  s('boltzmann', '고전 분포함수',
   p(raw`열저장체와 접촉한 계가 에너지 \(\varepsilon\)의 상태에 있을 확률은 볼츠만 인자에 비례한다. \(C\)는 정규화 상수다.`),
   eq(raw`P(\varepsilon)=C\exp\!\left(-\frac{\varepsilon}{k_BT}\right)`),
   w('boltzmann', '열저장체와 입자계', '온도를 조절하며 에너지 준위별 확률의 변화를 관찰한다. 표시한 네 준위 안에서 확률을 정규화했다.')),
  s('classical', '맥스웰–볼츠만 분포함수',
   p('구별 가능한 입자는 각각의 상태를 가진다. 같은 점유 배열에서도 입자를 교환한 배치는 다른 미시상태로 센다.'),
   eq(raw`f_{\mathrm{MB}}(\varepsilon)=e^{-\alpha}e^{-\varepsilon/(k_BT)}`),
   p(raw`\(\alpha\)는 전체 입자수 등 계의 제약으로 정해진다. 분포함수 \(f\)는 한 단일입자 상태의 평균 점유수다.`),
   w('mb-states', '구분되는 입자의 양자상태', '같은 점유 배열의 교환 중복도를 보손·페르미온과 비교할 수 있다.'))
 ]},
 {file: 'quantum-distributions.html', title: '양자통계', subtitle: '양자 분포함수', group: '양자통계', source: 'qdistribute/qdistribute2.html', sections: [
  s('states', '양자적인 입자',
   p(raw`상호작용이 없는 입자들의 계상태 에너지는 \(\sum_i n_i\varepsilon_i\)다. 보손은 \(n_i=0,1,2,\ldots\), 페르미온은 \(n_i=0,1\)만 허용된다.`),
   w('be-states', '보손의 양자상태', '원본의 단일입자·다입자 준위 도식을 점유 배열을 선택하는 방식으로 복원했다.'),
   w('fd-states', '페르미온의 양자상태', '배타원리에 따라 각 단일입자 상태를 한 입자만 점유한다. 스핀까지 지정한 상태를 뜻한다.')),
  s('bose', '보스–아인슈타인 분포함수',
   p(raw`고정된 입자수 \(N\)에 대해 점유 배열의 볼츠만 인자를 합하면 정준 분배함수 \(F_N\)을 얻는다.`),
   eq(raw`\begin{aligned}N&=\sum_i n_i,\qquad x_i=e^{-\varepsilon_i/(k_BT)}\\ F_N&=\sum_{\{n_i\}:\,\sum_i n_i=N}\prod_i x_i^{n_i}\\ \langle n_i\rangle_N&=x_i\frac{\partial\ln F_N}{\partial x_i}\end{aligned}`),
   p('입자수 제한을 생성함수로 처리하면 각 준위의 기하급수로 분해된다. 대정준 앙상블의 평균 점유수는 다음과 같다.'),
   eq(raw`\begin{aligned}\Gamma_{\mathrm{BE}}(z)&=\sum_{N=0}^{\infty}z^NF_N=\prod_i\frac{1}{1-zx_i}\\ z&=e^{\mu/(k_BT)}=e^{-\alpha}\\ f_{\mathrm{BE}}(\varepsilon)&=\frac{1}{e^{\alpha+\varepsilon/(k_BT)}-1}\end{aligned}`),
   p('광자는 생성·소멸할 수 있어 열평형에서 화학퍼텐셜이 0이다.'),
   eq(raw`f_{\mathrm{photon}}(\varepsilon)=\frac{1}{e^{\varepsilon/(k_BT)}-1}`)),
  s('fermi', '페르미–디랙 분포함수',
   p('페르미온의 각 점유수는 0 또는 1이므로 각 준위의 합은 두 항만 갖는다.'),
   eq(raw`\Gamma_{\mathrm{FD}}(z)=\prod_i(1+zx_i),\qquad f_{\mathrm{FD}}(\varepsilon)=\frac{1}{e^{\alpha+\varepsilon/(k_BT)}+1}`)),
  s('chemical', '분포함수와 화학퍼텐셜',
   eq(raw`\begin{aligned}N&=\sum_i f(\varepsilon_i),\qquad \alpha=-\frac{\mu}{k_BT}\\ f(\varepsilon)&=\begin{cases}e^{-(\varepsilon-\mu)/(k_BT)}&\mathrm{MB}\\[1ex]\bigl(e^{(\varepsilon-\mu)/(k_BT)}-1\bigr)^{-1}&\mathrm{BE}\\[1ex]\bigl(e^{(\varepsilon-\mu)/(k_BT)}+1\bigr)^{-1}&\mathrm{FD}\end{cases}\end{aligned}`),
   note('보손의 분포식은 ε > μ에서만 유효하다. 바닥상태가 0인 기체의 μ는 0 이하이며, 응축은 바닥상태를 따로 다뤄야 한다.'),
   questions('구별 가능한 2·3개 입자의 계상태를 배열하라.', '교환 중복도 N!/∏nᵢ!를 포함해 MB 분포를 유도하라.', '광자의 μ=0 조건에서 평균 점유수를 구하라.', '두 입자·네 상태에서 구별 가능한 배타 입자, 보손, 페르미온의 상태수를 비교하라.', '한 상태에 두 입자까지 허용하는 통계를 유도하라.'))
 ]},
 {file: 'distribution-comparison.html', title: '양자통계', subtitle: '분포함수의 비교', group: '양자통계', source: 'qdistribute/qdistribute3.html', sections: [
  s('compare', '분포함수의 비교',
   p(raw`같은 \(T,\alpha\)에서 세 평균 점유수를 비교한다. 보손 분포가 정의되는 영역에서는 BE > MB > FD다. \((\varepsilon-\mu)/(k_BT)\gg1\)이면 모두 고전 분포에 접근한다.`),
   w('distributions', '세 분포함수의 비교', '원본의 α 및 kT 슬라이더와 kT 표식을 복원했다. BE의 음수·발산 영역은 그리지 않는다.'),
   eq(raw`k_BT=8.617333262\times10^{-5}\,T\quad\mathrm{eV}`),
   w('scaled-distributions', '세 분포함수의 비교 — 에너지 축척', '가로축을 ε/kT로 바꾸고 α만 조절한다. 낮은 점유수에서 세 곡선이 합쳐지는 것을 관찰한다.')),
  s('fermi-limit', '페르미 에너지와 0 K 극한',
   p(raw`FD 함수는 \((\mu,1/2)\)를 중심으로 반대칭이다. 0 K에서 점유·비점유 상태를 나누는 에너지가 \(\varepsilon_F=\mu(0)\)다.`),
   eq(raw`\begin{aligned}f_{\mathrm{FD}}(\varepsilon)&=\frac{1}{e^{(\varepsilon-\mu)/(k_BT)}+1}\\ f_{\mathrm{FD}}(\mu+\delta)+f_{\mathrm{FD}}(\mu-\delta)&=1\\ \lim_{T\to0^+}f_{\mathrm{FD}}(\varepsilon)&=\begin{cases}1&\varepsilon<\mu\\ \frac12&\varepsilon=\mu\\ 0&\varepsilon>\mu\end{cases}\end{aligned}`),
   w('fermi-edge', '페르미 분포함수', '원본처럼 μ ≈ εF로 두고 0–10000 K의 분포를 비교한다. 경계 한 점의 값은 연속 극한인 1/2로 표시한다.'),
   questions('T→0에서 FD 분포가 계단형이 되는 이유를 설명하라.', 'f(μ+δ)+f(μ−δ)=1을 증명하라.', 'εF 아래·위의 적분을 계산하고 T→0 극한을 비교하라.'),
   eq(raw`\begin{aligned}\int_0^{\varepsilon_F}f(\varepsilon)\,d\varepsilon&=k_BT\ln\frac{1+e^{\varepsilon_F/(k_BT)}}{2}\\ \int_{\varepsilon_F}^{\infty}f(\varepsilon)\,d\varepsilon&=k_BT\ln2\end{aligned}`))
 ]},
 {file: 'density-of-states.html', title: '양자통계의 응용', subtitle: '상태밀도', group: '양자통계의 응용', source: 'qsexample/qsexample.html', sections: [
  s('density', '상태밀도',
   p(raw`\(g(\varepsilon)d\varepsilon\)는 에너지 구간에 있는 상태수다. 여기에 한 상태의 평균 점유수 \(f\)를 곱하면 그 구간의 입자수를 얻는다.`),
   eq(raw`dN=g(\varepsilon)f(\varepsilon)\,d\varepsilon`),
   w('density-product', '상태밀도와 입자 분포', '원본의 상태밀도×분포 도식을 세 곡선으로 연결했다. 각 곡선의 정규화는 캡션에 표시한다.')),
  s('one-d', '1차원 상자의 정상파',
   p('양 끝이 고정된 줄은 끝점에 마디를 가져야 한다. 허용된 모드를 양의 정수 격자에서 센다.'),
   eq(raw`\lambda=\frac{2L}{j},\qquad k=\frac{\pi j}{L},\qquad j=1,2,3,\ldots`),
   w('mode-1d', '줄의 진동 모드', '원본의 j=1–30 선택과 정상파 진동을 복원했다. L=1 m이며 시간은 시각화용 축척이다.')),
  s('two-d', '2차원 상자의 정상파',
   eq(raw`\begin{aligned}k_x&=\frac{\pi j_x}{L},\quad k_y=\frac{\pi j_y}{L}\\ k&=\frac{\pi}{L}\sqrt{j_x^2+j_y^2}\\ g_2(j)\,dj&=\frac{\pi}{2}j\,dj,\quad g_2(k)\,dk=\frac{L^2}{2\pi}k\,dk\end{aligned}`),
   w('mode-2d', '정사각형 막의 진동 모드', 'jₓ·jᵧ=1–20의 모드를 선택한다. 격자에서 원본의 18≤j≤19 띠와 선택 모드를 구별해 표시한다.')),
  s('three-d', '3차원 상자의 정상파',
   p('양의 세 정수로 모드를 지정한다. 큰 모드수에서 상태수는 구껍질 부피의 1/8로 근사한다.'),
   eq(raw`\begin{aligned}k&=\frac{\pi}{L}\sqrt{j_x^2+j_y^2+j_z^2}\\ g_3(j)\,dj&=\frac{\pi}{2}j^2\,dj\\ g(k)\,dk&=\frac{V}{2\pi^2}k^2\,dk\end{aligned}`),
   w('mode-3d', '3차원 모드수의 계산', '원본의 7×7×7 양의 정수 격자를 복원했다. 마우스·터치로 회전하거나 각도 슬라이더를 사용한다.')),
  s('particles', '빛과 전자의 상태밀도',
   p('빛은 두 편광, 전자는 두 스핀 상태를 포함한다. 각각의 에너지–파수 관계로 변수를 바꾸면 다음과 같다.'),
   eq(raw`\begin{aligned}g(\omega)\,d\omega&=\frac{V\omega^2}{\pi^2c^3}\,d\omega\\ \varepsilon&=\frac{\hbar^2k^2}{2m}\\ g(\varepsilon)\,d\varepsilon&=\frac{\sqrt2\,Vm^{3/2}}{\pi^2\hbar^3}\sqrt\varepsilon\,d\varepsilon\end{aligned}`),
   questions('1・2차원의 모드밀도와 빛·전자의 상태밀도를 계산하라.', '파동으로 센 상태수와 고전적 위상공간의 상태수를 비교하라.'))
 ]},
 {file: 'blackbody.html', title: '양자통계의 응용', subtitle: '흑체복사의 해석', group: '양자통계의 응용', source: 'qsexample/qsexample2.html', sections: [
  s('planck', '흑체복사의 해석',
   p('광자의 BE 점유수에 한 광자의 에너지를 곱하면 모드의 평균에너지가 된다. 상태밀도로 합산한 결과가 플랑크 법칙이다.'),
   eq(raw`\begin{aligned}\bar E&=\frac{\hbar\omega}{e^{\hbar\omega/(k_BT)}-1}\\ G(\omega)&=\frac{\omega^2}{\pi^2c^3}\\ \rho(\omega)&=G(\omega)\bar E\\ \rho(\nu)&=\frac{8\pi h\nu^3}{c^3(e^{h\nu/(k_BT)}-1)}\\ \rho(\lambda)&=\frac{8\pi hc}{\lambda^5(e^{hc/(\lambda k_BT)}-1)}\end{aligned}`),
   p('등방적인 공동 복사에서 표면을 지나는 분광복사출력은 에너지밀도의 c/4배다.'),
   eq(raw`\mathcal R(\lambda)=\frac c4\rho(\lambda)=\frac{2\pi hc^2}{\lambda^5}\frac1{e^{hc/(\lambda k_BT)}-1}`),
   w('blackbody', '흑체복사의 분광복사율', '원본의 온도·적분 구간·파장 선택을 복원했다. 세로축은 W m⁻² nm⁻¹이고 적분은 W m⁻²다.')),
  s('wien', '빈의 변위법칙',
   p('파장별 분광출력의 꼭짓점은 온도가 올라갈수록 짧은 파장으로 이동한다. 진동수별 꼭짓점은 서로 다른 밀도 함수의 극값이므로 단순히 환산한 파장과 다르다.'),
   eq(raw`\begin{aligned}\lambda_{\max}T&=\frac{hc}{4.9651142317\,k_B}\simeq2.897772\times10^{-3}\ \mathrm{m\,K}\\ \frac{xe^x}{e^x-1}&=5\\ h\nu_{\max}&\simeq2.82144\,k_BT\end{aligned}`)),
  s('stefan', '슈테판–볼츠만 법칙',
   eq(raw`\begin{aligned}\mathcal R_{\mathrm{total}}&=\int_0^\infty\mathcal R(\lambda)\,d\lambda=\sigma T^4\\ \sigma&=\frac{2\pi^5k_B^4}{15c^2h^3}\simeq5.670374419\times10^{-8}\ \mathrm{W\,m^{-2}\,K^{-4}}\end{aligned}`),
   questions('등방 복사에서 c/4의 관계를 유도하라.', '3300 K와 5800 K에서 400–700 nm의 복사 비율을 비교하라.', '가시광 비율을 가장 크게 만드는 온도를 찾아라.', '500 nm의 복사온도계를 2000 K 기준으로 보정하라. 저온 측정의 한계는 무엇인가?', '338 W/m²를 재복사하는 지구의 유효온도를 계산하라.', 'λmax 아래의 복사 비율과 두 복사 법칙을 수치로 검증하라.', '천만 K, 표면적 10 m²의 복사를 태양과 비교하라.', '2.725 K에서 파장·진동수 분포의 꼭짓점이 다른 이유를 설명하라.'))
 ]},
 {file: 'heat-capacity.html', title: '양자통계의 응용', subtitle: '고체의 비열', group: '양자통계의 응용', source: 'qsexample/qsexample3.html', sections: [
  s('classical-solid', '고체 내부의 격자진동',
   p('N개 원자의 3N개 진동 자유도에 등분배법칙을 적용하면 고전 비열을 얻는다. 저온에서는 이 값이 실험과 달라진다.'),
   eq(raw`E=3Nk_BT,\qquad C_{V,\mathrm{mol}}=3R\simeq24.94\ \mathrm{J\,mol^{-1}\,K^{-1}}`)),
  s('einstein', '아인슈타인의 비열이론',
   p('모든 진동자가 같은 고유진동수를 가진다고 가정한다. 영점에너지는 온도에 무관해 비열에 기여하지 않는다.'),
   eq(raw`\begin{aligned}\Theta_E&=\frac{\hbar\omega_E}{k_B}\\ E&=\frac{3N\hbar\omega_E}{e^{\Theta_E/T}-1}\\ C_V&=3Nk_B\left(\frac{\Theta_E}{T}\right)^2\frac{e^{\Theta_E/T}}{(e^{\Theta_E/T}-1)^2}\end{aligned}`)),
  s('debye', '데바이의 비열이론',
   p('고체 전체의 여러 진동 모드를 고려한다. 두 횡파와 한 종파의 모드를 포함하고, 가능한 전체 모드수를 3N으로 제한한다. 여기서는 음속을 하나로 근사한다.'),
   w('lattice', '아인슈타인과 데바이의 고체', '원본처럼 개별 진동자와 연결된 격자 운동을 나란히 보여준다. 진폭·모드·재생을 조절하는 기능을 추가했다.'),
   eq(raw`\begin{aligned}g(\omega)&=\frac{3V\omega^2}{2\pi^2v^3},\qquad\int_0^{\omega_D}g(\omega)\,d\omega=3N\\ \omega_D^3&=6\pi^2v^3\frac NV,\qquad\Theta_D=\frac{\hbar\omega_D}{k_B}\\ E&=9Nk_BT\left(\frac{T}{\Theta_D}\right)^3\int_0^{\Theta_D/T}\frac{x^3}{e^x-1}\,dx\\ C_V&=9Nk_B\left(\frac{T}{\Theta_D}\right)^3\int_0^{\Theta_D/T}\frac{x^4e^x}{(e^x-1)^2}\,dx\end{aligned}`),
   w('heat-capacity', '비열 모델의 비교', '원본 수식에서 계산한 추가 그래프다. 같은 특성온도를 놓고 고온 극한과 저온 거동을 비교한다.'),
   eq(raw`C_V\underset{T\ll\Theta_D}{\simeq}\frac{12\pi^4}{5}Nk_B\left(\frac T{\Theta_D}\right)^3`),
   questions('아인슈타인 모델의 에너지와 비열을 유도하고 고온·저온 극한을 구하라.', '데바이 비열의 고온 극한이 3NkB임을 보여라.', '저온 T³ 법칙의 계수를 계산하라.'),
   note('원본 질문의 아인슈타인 에너지 표현과 저온 지수 부호는 본문 모델과 차원이 일치하도록 정리했다. 변경 근거는 복원 기록에 남겼다.'))
 ]},
 {file: 'free-electrons.html', title: '양자통계의 응용', subtitle: '자유전자 기체', group: '양자통계의 응용', source: 'qsexample/qsexample4.html', sections: [
  s('electron-gas', '자유전자 기체',
   p('금속의 전자를 상자에 갇힌 비상대론적 페르미 기체로 근사한다. 두 스핀 상태를 포함한 상태밀도를 낮은 에너지부터 채운다.'),
   eq(raw`\begin{aligned}g(\varepsilon)&=\frac{\sqrt2Vm^{3/2}}{\pi^2\hbar^3}\sqrt\varepsilon\\ N&=\int_0^{\varepsilon_F}g(\varepsilon)\,d\varepsilon\\ \varepsilon_F&=\frac{\hbar^2}{2m}\left(\frac{3\pi^2N}{V}\right)^{2/3}\\ \frac{E_0}{N}&=\frac35\varepsilon_F\end{aligned}`),
   w('free-electrons', '금속의 전자 분포', '원본의 εF=1–12 eV, T=0–2000 K 범위를 복원했다. 원본의 μ≈εF 근사와 입자수 보존 계산을 선택한다.')),
  s('electron-heat', '온도를 올렸을 때의 총에너지',
   p(raw`\(k_BT\ll\varepsilon_F\)이면 페르미면 근처의 전자만 열적으로 재배치된다. 상태밀도를 일정하게 근사하면 에너지 증가가 \(T^2\), 전자 비열은 \(T\)에 비례한다.`),
   w('metal-energy', '금속의 열용량 계산', '원본의 전자·정공 영역을 복원했다. μ 근처에서 상태밀도를 일정하게 둔 국소 도식이다.'),
   eq(raw`\begin{aligned}\Delta E&\approx2g(\varepsilon_F)\int_0^\infty\frac{y}{e^{y/(k_BT)}+1}\,dy\\ &=\frac{\pi^2}{6}g(\varepsilon_F)(k_BT)^2\\ E(T)&\approx\frac35N\varepsilon_F+\frac{\pi^2}{4}N\frac{(k_BT)^2}{\varepsilon_F}\\ C_V&\approx\frac{\pi^2}{2}Nk_B\frac{k_BT}{\varepsilon_F}\end{aligned}`)),
  s('pressure', '전자에 의한 압력',
   p('0 K의 축퇴압력은 페르미 에너지의 부피 의존성에서 나온다. 금속에서는 이온의 인력과 함께 평형을 이룬다.'),
   eq(raw`P=-\frac{dE_0}{dV}=\frac25\frac NV\varepsilon_F,\qquad PV=\frac23E_0`),
   questions('리튬의 밀도 534 kg/m³, 원자질량 6.941 u에서 εF와 TF를 구하라. 원자당 전자는 1개다.', '구리의 밀도 8960 kg/m³, 원자질량 63.546 u로 같은 계산을 하여 전자 비열을 비교하라.', '온도가 올라갈 때 입자수를 보존하려면 μ가 감소하는 이유를 설명하라.', '축퇴압력과 PV=2E₀/3을 유도하라.'))
 ]},
 {file: 'neutron-stars.html', title: '양자통계의 응용', subtitle: '중성자별', group: '양자통계의 응용', source: 'qsexample/qsexample5.html', sections: [
  s('degeneracy', '페르미 입자의 축퇴압력',
   p('전자나 중성자가 낮은 양자상태를 채우면 온도가 0이어도 압력이 존재한다. 백색왜성은 주로 전자, 중성자별은 중성자 등의 압력으로 중력에 맞선다.'),
   p('원본의 계산은 균일한 밀도, 비상대론적 이상 중성자 기체, 뉴턴 중력을 가정한 교육 모형이다. 실제 중성자별의 핵 상호작용과 일반상대론은 포함하지 않는다.')),
  s('balance', '중성자 기체와 중력의 평형',
   eq(raw`\begin{aligned}E_g&=-\frac35\frac{GM^2}{R},\qquad V=\frac{4\pi R^3}{3}\\ P_g&=-\frac{GM^2}{5}\left(\frac{4\pi}{3}\right)^{1/3}V^{-4/3}\\ P_n+P_g&=0,\qquad N=\frac M{m_n}\\ R&=\left(\frac{3\sqrt\pi}{2}\right)^{4/3}\left(\frac{\hbar^6}{G^3m_n^8}\right)^{1/3}M^{-1/3}\end{aligned}`),
   p('이 모형에서는 질량이 커질수록 반경이 줄고 밀도가 커진다. 원본의 1.5 태양질량 예제를 기준으로 값을 비교한다.'),
   w('neutron-star', '중성자별의 내부구조와 평형', '원본의 내부 층 도식을 새 SVG로 복원했다. 질량–반경 계산은 추가 기능이며 실제 관측 예측이 아니다.')),
  s('white-dwarf', '백색왜성으로의 확장',
   p('중력은 주로 핵자가 만들고 축퇴압력은 전자가 제공한다. 전자당 약 두 핵자가 있다고 놓으면 아래 모형식을 얻는다.'),
   eq(raw`R=\left(\frac{3\sqrt\pi}{2^{9/4}}\right)^{4/3}\left(\frac{\hbar^6}{G^3m_e^3m_n^5}\right)^{1/3}M^{-1/3}`),
   questions('1.5 태양질량에서 반경·압력·밀도를 계산하고 원본의 10.75 km, 2×10³³ Pa, 5.75×10¹⁷ kg/m³와 비교하라.', '그 별의 중성자 페르미 에너지를 추정하라.', '압력 평형에서 중성자별의 질량–반경 관계를 유도하라.', '전자당 두 핵자라는 가정으로 백색왜성 반경을 유도하라.', '핵자가 10⁵⁷개인 백색왜성에서 전자 에너지를 구해 비상대론적 근사의 타당성을 판단하라.'))
 ]}
];
