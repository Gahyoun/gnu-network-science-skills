# 정기수 교수님 논문 서지정보 확인 기록

확인일: 2026-10-05. 정본 데이터: `src/publications.json`.

[교수님의 ResearchGate 목록](https://www.researchgate.net/profile/Ki-Soo-Chung/research)에 표시된 59개 항목에서 같은 DOI의 중복 1개를 합쳐 58편을 수록했다. 원본 웹교재 제작자 소개에 실린 핵·입자물리 공동연구 2편을 더해 추가로 제공된 원본 소개 자료와 대조하여 핵·입자물리, 광학·소자, 물리교육 논문 13편을 보강했다. 총 73편(확인된 DOI 71개, DOI 미확인 2편)이다. 완전한 전체 업적 목록이라고 주장하지 않는다.

논문 제목, 저널, 저자 순서, 권·호·쪽, DOI는 출판사가 등록한 [Crossref API](https://api.crossref.org/works) 자료와 대조했다. 각 기록의 `source`에 사용한 메타데이터 주소를 남겼다. 원문·초록·논문 그림을 복제하지 않는다. DOI 링크는 원 출판물로 연결한다. 공동저자가 많은 논문도 펼치면 전체 저자를 읽을 수 있다.

## 날짜와 예외

- 날짜는 월까지 표시하며, 저널 발행일(`published-print`)을 우선하고 없으면 온라인 출판일을 사용한다. 온라인 선공개 때문에 ResearchGate 월과 다를 수 있다. 원래 목록의 월은 `profileDates`에 보존했다.
- *Development of LiF:Mg,Cu,Si TL material…*은 ResearchGate의 2007/2006 항목이 DOI `10.1093/rpd/ncl122`로 동일하다. [출판사 권호](https://academic.oup.com/rpd/article-abstract/125/1-4/229/1603809)의 2007.07을 적용했다.
- *Dielectric Relaxation Spectroscopy in Synthetic Rubber Polymers…*은 Crossref의 인쇄 2020.01 대신 [출판사가 명시한 최초 발행](https://onlinelibrary.wiley.com/doi/10.1155/2020/8406059) 2020.05를 적용했다.
- *Developments in the synthesis of LiF:Mg,Cu,Na,Si TL Material*은 Crossref에 저자가 1명만 있어 [출판사 명단](https://academic.oup.com/rpd/article/108/1/79/1595873)의 5명으로 보완했다.
- DOI `10.7316/khnes.2022.33.1.67`은 출판사 웹/메타데이터의 `CHUN` 대신 [출판사 PDF](https://journal.hydrogen.or.kr/xml/32284/32284.pdf)에 인쇄된 `CHUNG`을 사용했다. 한글 저자 정기수와 GNU 소속도 일치한다.
- *Comment on the deformation of quantum mechanics*와 *The q-deformed Poisson bracket…*은 목록의 1999 대신 출판 메타데이터의 1994년을 적용했다. 이름이 비슷한 후속 comment 및 도서 챕터와 혼동하지 않도록 제목·DOI·저자를 확인했다.
- 2009.12 *Analysis of the LiF:Mg,Cu,Si TL and the LiF:Mg,Cu,P TL Glow Curves by Using General Approximation Plus Model*은 [공개된 논문 첫 쪽](https://www.researchgate.net/publication/264203261)에서 저자, 저널, 권호와 시작 쪽 155를 확인했다. DOI를 확인하지 못해 `null`과 ‘DOI 미확인’을 사용했다. 다른 논문의 DOI를 붙이지 않았다. 끝 쪽 164는 추가로 제공된 원본 소개 자료를 반영했다. 원본 PDF 첫 쪽 확인과 제공 자료의 범위 보강을 구별해 `pagesBasis`에 기록했다.
- 핵·입자물리 2편은 [원본 제작자 소개](http://physica.gnu.ac.kr/info/info_cont.html#maker)에 실린 제목과 Crossref DOI `10.1143/ptp.89.493`, `10.1143/ptp.89.679`의 전체 저자 명단(K. S. Chung 포함)을 대조했다. 전자는 [KEK E176 연구 기록](https://www-ps.kek.jp/kekps/eppc/Review/E_pdf/E176.pdf)에도 수록되어 있다.

## 분야 표시

응용·소자(사각형), 광학·발광(원), 핵·입자물리(마름모), 양자·이론(육각형), 물리교육(삼각형)은 복원자가 논문 주제에 따라 붙인 탐색 분류다. 교수님 또는 저널의 공식 분류를 뜻하지 않으며, 여러 분야에 걸친 연구는 대표 분야 한 개로 표시한다. 색상 없이도 모양과 분야명으로 구별한다.

HTML은 빌드 단계에서 생성한다. 웹 방문 시 외부 API 호출이나 계정이 필요 없고, JavaScript가 꺼져도 서지정보와 DOI를 읽을 수 있다.

## 추가로 제공된 원본 자료 반영

2026-10-05 제공된 관심분야·학력/경력·논문 자료로 원저자 소개를 보강했다. 날짜의 종료가 없는 경력은 현재 재임을 뜻하지 않도록 원본 기록임을 표시했다. 『현대물리실험』(탐구당, 1994)은 저서에 따로 적었다.

추가 논문은 Crossref의 제목·연도·권호·쪽과 K. S. Chung의 공저자 포함을 대조해 12편을 추가했다. *Thermoluminescence of Magnesium Aluminum Spinel* 검색에서 나온 2001년 다른 저자의 동명 논문은 채택하지 않았다. 메타데이터에서 누락된 Dₛ·D* 등의 기호는 제공된 원본 제목을 사용하고 `titleBasis`에 기록했다.

고등학교 기체 분자 운동론의 WAL 교육 논문은 [KCI의 서지정보](https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART001112633)로 저자 4명과 저널·권호·쪽·2005년을 확인하여 추가했다. 월과 DOI는 확인되지 않아 연도만 표시하고 DOI 미확인으로 남겼다. 자료에서 주어진 날짜와 페이지가 출판사 기록과 다르면 출판사 기록을 우선했다. 확인되지 않은 다른 항목에 유사 제목의 DOI를 붙이지 않았다.
