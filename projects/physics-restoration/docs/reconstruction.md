# 복원 근거와 범위

조사일: 2026-10-04. 원저자: 정기수 교수님. 원본: <http://physica.gnu.ac.kr/>.

## 자료와 방법

두 단원의 HTML 8개, SWF 9개, 기존 Adobe Animate Canvas 도식 7개의 HTML·JS 14개를 확보해 주소·크기·SHA-256을 기록했다. 원본 HTML은 CP949로 읽었다. JPEXS FFDec **26.3.0**으로 9개 SWF의 ActionScript를 추출하고 분포식, 루프, 슬라이더 최소·최대·간격·초깃값, 좌표 변환, 적분 방식을 조사했다.

추출한 코드는 조사용 보관 영역에만 있으며 공개 저장소에 넣지 않았다. 새 프로그램은 ES modules와 SVG로 독립 작성했다. Flash Player에서의 실제 재생 화면과 프레임별로 대조한 것은 아니므로 픽셀·프레임 단위의 동일성을 주장하지 않는다. 글과 탐구 질문도 새로 서술했다. 원본 전체를 전사한 판본이 아니라, 단원 순서·수식·실험 목적을 이어가는 1차 복원본이다.

## 원본과 대응

각 경로는 원본의 `/phtml/modern/q_statistics/`에 상대적이다.

| 원본 자료 | 복원 쪽 / 실험 | 확인한 동작과 새 구현 |
|---|---|---|
| qdistribute/boltzmannf_Canvas.js | quantum-statistics / boltzmann | 열저장체와 입자계 도식. 네 준위의 정규화 확률과 온도 조절 추가 |
| qdistribute/mbparticle_Canvas.js | quantum-statistics / mb-states | 단일입자·다입자 준위. 점유 배열, 총에너지와 N!/∏nᵢ! 중복도 |
| qdistribute/beparticle_Canvas.js | quantum-distributions / be-states | 보손 점유 배열, 입자 2·3개 선택과 상태 표 |
| qdistribute/fdparticle_Canvas.js | quantum-distributions / fd-states | 한 상태에 한 입자, 입자 2·3개 선택과 상태 표 |
| qdistribute/distributionftn.swf | distribution-comparison / distributions | α −10…10, Δα 0.1, 초기 0; kBT 0.2…10 eV, 간격 0.1, 초기 5; MB/BE/FD 비교 |
| qdistribute/distributionftnx.swf | distribution-comparison / scaled-distributions | ε/(kBT) 0…7, α −2…2, 간격 0.1, 초기 0 |
| qdistribute/fddistftn.swf | distribution-comparison / fermi-edge | εF 0…7 eV, 초기 4; T 0…10000 K, 간격 100, 초기 5000; 0·2000…10000 K 기준선 |
| qsexample/gftnnftn_Canvas.js | density-of-states / density-product | g, f, n=g×f 도식. 통계·μ·kBT 조절 추가 |
| qsexample/mode1dim.swf | density-of-states / mode-1d | j 1…30, 초기 10; L=1, k=πj, λ=2/j, sin(πjx)cos(jt), 양 끝 고정 |
| qsexample/mode2dim.swf | density-of-states / mode-2d | jₓ,jᵧ 1…20, 초기 (7,3); 18≤j≤19 껍질과 교대 부호 마디 패턴 |
| qsexample/mode3dim.swf | density-of-states / mode-3d | 1…7 양의 정수 격자 343개, 11…11.55 껍질, 마우스 회전. 키보드 회전 슬라이더 추가 |
| qsexample/grblackbody.swf | blackbody / blackbody | T 500…10000 K, 초기 5000; 선택 파장 500 nm, 클릭 선택과 두 적분 경계. 원본 온도 간격 100→50 K, 파장 범위 확장 |
| qsexample/solidosc.swf | heat-capacity / lattice | 왼쪽 개별 진동자 4개, 오른쪽 연결 격자 5×4. 재생·진폭·공간 모드 선택 추가 |
| 원본 Einstein/Debye 수식 | heat-capacity / heat-capacity | 추가 비교 그래프. 공통 Θ에 대해 CV/(3NkB) 계산 |
| qsexample/freeelectronftn.swf | free-electrons / free-electrons | εF 1…12 eV, 간격 0.1, 초기 6; T 0…2000 K, 간격 10, 초기 500. μ≈εF와 N 보존 선택 |
| qsexample/metalsta_Canvas.js | free-electrons / metal-energy | μ 양쪽의 전자·정공, 저온 에너지/비열. 온도·εF 조절 추가 |
| qsexample/neutronstar_Canvas.js | neutron-stars / neutron-star | 내부 층 개념. 새 SVG, 균일밀도 교육 모형의 질량–반경 계산 추가 |

양자통계는 `qdistribute.html`부터 `qdistribute3.html`, 응용은 `qsexample.html`부터 `qsexample5.html`의 순서를 유지한다. 순차 탐구 질문은 각 쪽의 ‘질문과 탐구’에 있다.

## 물리적 정리

1. **상수와 단위:** h·kB·c·e는 현대 SI 정의값이다. G·입자 질량은 CODATA 2022 값, 태양질량은 1.98847×10³⁰ kg의 교육용 값이다. 모든 상수가 정의상 정확하다는 의미는 아니다. 에너지는 표시에서 eV, 흑체 분광출력은 W m⁻² nm⁻¹로 변환한다.
2. **FD 0 K:** 원본 코드의 ε=εF 한 점을 1에서 T→0⁺의 연속 극한 1/2로 표시한다. 적분 결과에는 영향을 주지 않는다.
3. **BE 정의역:** ε−μ≤0에서 계산선을 끊는다. α<0 슬라이더는 원본 범위를 유지하지만 바닥에너지 0인 보손 기체의 평형 조건과 구분한다.
4. **앙상블:** 고정 N의 정준 분배함수와 생성함수로 얻는 대정준 평균 점유수를 구별한다. 스핀을 포함해 정의한 단일입자 상태마다 FD의 점유 상한이 1이다.
5. **비열:** 원본 질문의 아인슈타인 에너지는 3Nℏω/(e^(ℏω/kBT)−1)로 차원을 정리하고 저온에서 비열이 지수적으로 감소함을 표시한다. 데바이의 저온 T³ 계수와 고온 3NkB를 확인한다.
6. **전자:** μ≈εF는 원본의 저온 근사다. 추가한 N 보존 모드는 u=√(ε/εF) 적분과 이분법으로 μ를 결정한다. 평균에너지는 E(T)/N(T)로 표시한다. Sommerfeld 근사는 kBT≪εF에서만 유효하다.
7. **중성자별:** 원본의 비상대론·균일밀도·뉴턴 중력 모형을 유지한다. 현대 상수로 1.5 태양질량에서 R=10.7756 km, ρ=5.69109×10¹⁷ kg/m³, P=2.10281×10³³ Pa, εF=96.5672 MeV다. 원본의 반올림된 수치와 차이가 있다. 층 그림은 별도의 개념도이며 실제 상태방정식이나 상대론적 별 구조를 계산한 결과가 아니다.

## 검증

- 독립 물리 불변량·극한 7개 테스트 그룹: 고전 극한, 점유수 제한과 상태수, Wien 최대, σT⁴와 직접 파장 적분, T³ 비열, 고정 경계 정상파, N 보존·Sommerfeld, 압력 평형·질량 스케일링.
- 브라우저 결과는 `browser-report.json`: 문서 10개, 수식/실험 렌더링, 중복 ID·내부 앵커, 자산 오류·외부 요청, 화면 폭, 조절 경계값·키보드·재생·정지·확대·JS 비활성 검증.
- PNG와 인쇄 PDF는 로컬 `preview/`에 생성한다. 인쇄물은 현재 선택한 실험 상태를 담는다.

## 서체 최적화

Noto Sans KR와 SUITE에서 현재 교재·조작 화면에 필요한 글자만 WOFF2로 다시 저장했다. 원본 대비 합계 1,633,140→151,940 bytes로 90.7% 감소했다. SIL OFL의 Reserved Font Name을 유지하지 않도록 내부 이름을 PhysicaText·PhysicaTitle로 바꾸고 저작권·라이선스는 보존했다. 추가 한글의 누락은 빌드에서 검사하며 재생성 절차는 README에 있다. `font-report.json`에 크기·포함 한글을 기록한다.

## 참고 문서

- [원본 저작권 안내](http://physica.gnu.ac.kr/info/info_cont.html#copyright)
- [학과의 물리의 이해 소개](https://sites.google.com/view/gnu-physics-job/유용한-서비스사이트)
- [GNU template](../../../templates/gnu-template/SKILL.md)
- [KaTeX의 renderToString](https://katex.org/docs/api.html)
- [NIST CODATA 원자료](https://physics.nist.gov/cuu/Constants/Table/allascii.txt)
- [GitHub Pages 사용자 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [JPEXS 공식 26.3.0 릴리스](https://github.com/jindrapetrik/jpexs-decompiler/releases/tag/version26.3.0)
