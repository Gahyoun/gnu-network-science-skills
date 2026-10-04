# 캐릭터 지누·누누

대학 홈페이지의 공식 캐릭터 파일을 이 폴더에 모아 쓴다. 저장소에 파일이 없으면 학교 사이트에 접속할 수 있는 PC에서 아래 순서로 채운다.

```bash
python3 scripts/assets.py --fetch-character --dry-run   # 공식 페이지의 내려받기 목록만 확인
python3 scripts/assets.py --fetch-character             # official/에 저장하고 manifest.json에 출처·SHA-256 기록
```

수집 대상 페이지는 [대학 캐릭터(지누)](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12102&cntntsId=5777)와 [캐릭터 응용 디자인](https://www.gnu.ac.kr/main/cm/cntnts/cntntsView.do?mi=12104&cntntsId=5779) 등 `scripts/assets.py`의 `CHARACTER_PAGES`다. 메뉴 주소가 바뀌면 그 목록을 고친다. 이미 있는 파일은 덮어쓰지 않는다.

## HTML에 넣기

HTML에는 `.ai`를 직접 넣을 수 없다. 공식 PNG가 있으면 그대로 쓰고, AI 원본만 있으면 한 자세를 SVG로 잘라 낸다. 벡터 경로와 색은 바꾸지 않는다.

```bash
python3 scripts/derive_svg.py --source "assets/character/official/<파일>.ai" --preview out/character.png
# PNG의 픽셀 좌표가 곧 pt 좌표다. 원하는 자세를 감싸는 X Y W H를 확인한다.
python3 scripts/derive_svg.py --source "assets/character/official/<파일>.ai" --crop X Y W H \
  --output assets/character/derived/jinu.svg
python3 scripts/build.py seminar --data data/seminar.json --character assets/character/derived/jinu.svg --output out/seminar.html
```

`derive_svg.py`에는 Poppler의 `pdftocairo`와 `pip install svgelements`가 필요하다. macOS는 `brew install poppler`, Ubuntu는 `sudo apt install poppler-utils`.

## 쓰는 규칙

자리·크기·금지 사항은 [DESIGN.md 6장](../../DESIGN.md#6-캐릭터-지누누누)에 있다. 요약하면 한 쪽에 한 자세, 오른쪽 아래, 말풍선·대사·재작화·반전·색 변경 금지, 본문과 겹치지 않기다. 공식 페이지의 이용 조건이 우선한다.

캐릭터의 권리는 경상국립대학교에 있다. 이 저장소의 GPL-3.0은 캐릭터 이용 허락이 아니다. 판매용 상품이나 외부 홍보물에는 담당 부서와 먼저 협의한다.
