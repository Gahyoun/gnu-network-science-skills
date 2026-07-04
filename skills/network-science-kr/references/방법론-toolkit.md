# 방법론 툴킷 — 수학 · 물리 · 데이터과학

이 스킬의 기술적 근육. 주장을 유도로 뒷받침하고, 분석을 올바른 estimator·null model 위에 세울 때 참조한다.
각 절은 "무엇을, 왜, 어떤 가정·한계로" 순으로 압축했다.

## 목차
- A. 수학적 토대 (행렬·스펙트럴·생성함수·그래프이론)
- B. 물리적 토대 (통계역학·상전이·정보이론·재규격화)
- C. 데이터과학 토대 (추정·표집·임베딩/GNN·검정·확장성·불확실성)
- D. 통합 rigor 체크리스트

---

## A. 수학적 토대

### A1. 핵심 행렬
- **인접행렬** A (A_ij = 엣지 유무/가중치). 방향/이분/가중은 A의 대칭성·부호로 표현.
- **도수·라플라시안**: D = diag(k_i), **Laplacian** L = D − A, **정규화 Laplacian** L_sym = I − D^(−1/2) A D^(−1/2).
- **modularity 행렬** B_ij = A_ij − k_i k_j / (2m). configuration-model 기대치를 뺀 것 → Newman의 modularity Q = (1/2m) Tr(sᵀ B s).
- **transition 행렬** P = D^(−1) A (랜덤워크), 정상분포 π_i ∝ k_i (무방향).

### A2. 스펙트럴 이론 (거의 모든 것이 고유값 문제)
- **λ₂(L)** = algebraic connectivity(Fiedler value): 연결성·병목의 척도, spectral partitioning(Fiedler vector 부호로 이분).
- **spectral gap** (P의 1 − λ₂): 랜덤워크 혼합시간·mixing, expander 여부.
- **λ_max(A)** (leading eigenvalue): epidemic threshold(τ_c = 1/λ_max), eigenvector centrality, 국소화(localization) 진단.
- 중심성 통일: eigenvector( A x = λx ) → Katz( (I−αA)⁻¹ ) → PageRank(정규화+텔레포트). 전부 leading-eigenvector 계열.
- **RMT 관점**: 스펙트럴 밀도 ρ(λ). Erdős–Rényi는 반원(Wigner) 근사, scale-free는 heavy-tailed·삼각형 스펙트럼. bulk에서 벗어난 outlier eigenvalue = 구조 신호(커뮤니티·core-periphery).

### A3. 생성함수 (sparse 네트워크의 주력 해석 도구)
- 도수분포 p_k → G₀(x) = Σ p_k xᵏ, 이웃의 excess-degree → G₁(x) = G₀'(x)/G₀'(1).
- **Molloy–Reed criterion**: giant component 존재 ⇔ ⟨k²⟩ − 2⟨k⟩ > 0 (즉 κ = ⟨k²⟩/⟨k⟩ > 2).
- giant component 크기 S = 1 − G₀(u), u = G₁(u) (self-consistency).
- **percolation threshold** (무작위 노드 제거 φ): φ_c = 1 − 1/(κ − 1). scale-free(⟨k²⟩→∞)면 φ_c → 1 = 무작위 고장에 견고하지만 표적 공격에 취약.
- 같은 틀로 bond percolation·SIR 최종 크기·전염 임계치를 유도.

### A4. 그래프이론 기계
- 경로·거리·BFS/Dijkstra, min-cut/max-flow(Menger), **maximum matching**.
- **구조적 제어(Liu–Slotine–Barabási)**: driver 노드 최소집합 = maximum matching으로 unmatched 노드; 도수분포가 controllability를 지배.
- 모티프·graphlet, k-core 분해, tree-width(근사·전파의 난이도).

---

## B. 물리적 토대

### B1. 네트워크의 통계역학 (maximum-entropy 앙상블)
- **ERGM / exponential random graph**: P(G) = exp(Σ_a θ_a x_a(G)) / Z. 제약(평균 도수, 삼각형 등)에 대한 maximum-entropy 분포. θ = Lagrange 승수, Z = partition function.
- configuration model = 도수수열을 보존하는 maximum-entropy 앙상블(soft: canonical / hard: microcanonical). null model의 물리적 정당화가 여기서 나온다.
- canonical vs microcanonical **nonequivalence**(Squartini–Garlaschelli): 제약이 heavy-tailed면 앙상블 선택이 결과를 바꿈 — 주의.

### B2. 상전이 (네트워크 위 현상의 핵심 언어)
- **percolation**: 연속(2차) 전이, giant component가 order parameter, φ_c 근처 임계지수·클러스터 크기 분포 τ.
- **k-core / bootstrap percolation**: 불연속(1차) 하이브리드 전이.
- **interdependent networks(Buldyrev 2010)**: cascading failure → 급격한(1차) 붕괴. 단일망 직관이 깨지는 대표 사례.
- **epidemic**: SIS/contact process = 흡수상태 전이, 임계치 τ_c = 1/λ_max(A). SIR = bond percolation 사상. scale-free에서 τ_c → 0(⟨k²⟩ 발산).
- **synchronization**: Kuramoto on networks, **master stability function**(Pecora–Carroll)으로 동기화 안정성을 L의 스펙트럼(λ₂, λ_N, eigenratio λ_N/λ₂)에 환원. 고차 상호작용은 explosive(1차) 동기화 유발.
- **finite-size scaling**: 유한 n에서 임계점은 흐려진다. 관측량 X(n) ~ n^(−β/ν̄) f((p−p_c) n^(1/ν̄)) 형태로 스케일 붕괴시켜 임계점·지수를 추정. "전이처럼 보임"과 "전이"를 구별하는 표준 절차.

### B3. 정보이론·엔트로피
- **von Neumann entropy** of ρ = L/Tr(L): 네트워크 복잡도·비교(그래프 간 거리).
- **mutual information / NMI**: 커뮤니티 분할 비교의 표준 지표(단, MI 편향·조정 NMI 주의).
- **description length (MDL)**: SBM 모델선택 = 데이터 + 모델 부호화 길이 최소화(Occam). 블록 수 K를 과적합 없이 추론.
- entropy-based null·surprise, transfer entropy(방향성 정보흐름, 재구성).

### B4. 재규격화·다중스케일
- **geometric renormalization**(Boguñá–Serrano): 잠재 하이퍼볼릭 공간에서 coarse-grain → 실제 네트워크의 self-similarity 설명.
- coarse-graining/블록화가 스케일에 걸쳐 어떤 불변량을 보존하는가로 "본질적 구조"를 정의.

---

## C. 데이터과학 토대

### C1. 추정과 추론
- **MLE / Bayesian**: SBM·degree-corrected SBM의 파라미터·블록 추정. Newman·Peixoto 계열.
- **모델선택**: MDL / marginal likelihood / nested SBM으로 블록 수와 계층을 데이터가 정하게 한다(휴리스틱 K 지정 금지).
- **belief propagation / cavity**: sparse 그래프에서 SBM의 근사 추론·detectability threshold(정보이론적 한계 아래선 어떤 알고리즘도 커뮤니티 못 찾음 — Decelle et al.).
- descriptive(modularity 최적화)와 inferential(SBM 적합)의 차이를 항상 의식: 전자는 구조가 없어도 무언가 찾아낸다.

### C2. 표집·편향 (데이터가 이미 왜곡)
- snowball/respondent-driven/API 표집 → 도수분포·중심성 왜곡. **friendship paradox**(이웃의 평균 도수 > 자기 도수)로 hub 과표집.
- 관측 누락(false negative edge)·측정오차 → 재구성/robust estimator 필요.
- 표집 보정: Horvitz–Thompson 가중, RDS estimator.

### C3. 표현학습 (임베딩·GNN)
- **spectral embedding**: L 또는 modularity 행렬의 상위 고유벡터 = 고전적 임베딩(스펙트럴 클러스터링의 근거).
- **node2vec / DeepWalk**: 랜덤워크 + skip-gram(word2vec). 사실상 특정 행렬의 암묵적 분해(Qiu et al.).
- **GNN**: message passing (h_i ← 이웃 집계). GCN = 정규화 Laplacian 스무딩, GAT = attention 가중.
  - 구조적 한계: **over-smoothing**(깊어지면 표현이 도수·컴포넌트로 붕괴 — Laplacian 스무딩의 극한), **over-squashing**(long-range 정보가 병목에서 압축; Ricci curvature와 연결).
  - SBM과의 관계: contextual SBM에서 GNN의 정보이론적 최적성·detectability.
- **링크예측 평가**: edge holdout, AUC-ROC / AUPRC / precision@k, temporal split(미래 누출 방지).

### C4. 통계적 검정 (유의성)
- 관측값을 **null-model 앙상블**과 비교: configuration model / degree-preserving double-edge swap(rewiring) N회 → z-score, empirical p-value.
- **다중비교** 보정(모티프·엣지 다수 검정 시 FDR).
- **부트스트랩 on networks**: subsampling·edge/​node resampling으로 신뢰구간(단, 엣지 의존성 때문에 iid 부트스트랩은 편향 — 조심).

### C5. 확장성 (계산 현실)
- sparse 표현(CSR), **power iteration**(eigenvector/PageRank), Lanczos(상위 스펙트럼).
- 근사 estimator: betweenness의 pivot/sampling 근사(Brandes+sampling), approximate personalized PageRank(push).
- 큰 그래프: `igraph`/`graph-tool`(C 백엔드), out-of-core·스트리밍, GPU(GNN).

### C6. 재구성 (관측 → 구조)
- 시계열/동역학에서 엣지 추론: regularized regression(LASSO), transfer entropy / Granger causality, dynamics-based inference. 상관 ≠ 엣지 원칙.

### C7. 불확실성 정량화
- 점추정 대신 posterior/앙상블. 특히 epidemic·network medicine에서 예측구간·시나리오. 부트스트랩·베이즈 credible interval.

---

## D. 통합 rigor 체크리스트

주장을 내기 전에 세 축을 모두 통과했는지 본다:

1. **[수학]** 유도가 있나? sparse면 생성함수/스펙트럴로 스케일(임계치·크기)을 닫힌 형태 또는 self-consistency로 확인했나?
2. **[물리]** 이게 상전이라면 어떤 종류(연속/불연속)이고 order parameter·임계치·finite-size scaling을 확인했나? null 앙상블은 canonical/microcanonical 중 물리적으로 맞는 것인가?
3. **[데이터]** estimator가 명시적인가(MLE/Bayes/MDL)? 표집·관측 편향을 보정했나? 유의성을 적절한 null-model 앙상블과 z-score/p-value로 봤나? 불확실성을 보고했나?
4. **[통합]** descriptive와 inferential 결과가 일치하나? 계산은 독립 방법으로 재현되나? 결론이 스케일·해상도에 강건한가?
