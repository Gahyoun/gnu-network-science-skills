# 랩 환경 초기 세팅

처음 오신 분을 위한 안내입니다. 순서대로 따라오시면 되고, **중간에 실패해도 아무것도 망가지지
않습니다.** 잘 모르겠는 항목은 건너뛰었다가 필요해질 때 돌아오셔도 괜찮습니다.

다 하면 이런 게 됩니다:

- 네트워크 과학 질문을 한국어 용어로 제대로 답하는 스킬이 붙습니다
- Claude 가 arXiv·OpenAlex·Crossref 에서 직접 문헌을 찾아옵니다
- 무거운 계산을 내 노트북 대신 **랩 서버에서** 돌립니다
- 매주 월요일 아침에 network science 신규 논문 목록이 쌓입니다

소요 시간은 1번만 하면 5분, 전부 하면 20분쯤입니다.

---

## 1. Claude Code 설치

이미 쓰고 계시면 건너뛰세요.

데스크톱 앱은 [claude.ai/download](https://claude.ai/download), 터미널만 쓰시려면:

```bash
npm install -g @anthropic-ai/claude-code
```

설치 후 `claude` 를 한 번 실행해 로그인합니다. 학교 계정이 있으면 그걸로 로그인하세요.

---

## 2. 스킬 설치

메인 [README](../README.md#설치--터미널에-복붙만-macos--linux--windows) 의 복붙 블록 한 번이면 끝납니다.
설치 후 **새 세션**(터미널 재시작)에서 `/network-science-kr` 를 쳐보면 잡히는지 알 수 있습니다.

---

## 3. Claude Science — 문헌 도메인 열기

> 데스크톱 앱 **설정 → Network** 에서 합니다.

Claude 가 코드를 돌려서 데이터를 가져올 때, **여기 목록에 있는 주소로만** 접속할 수 있습니다.
기본값은 대부분 잠겨 있어서, 논문을 찾아달라고 해도 못 가져옵니다.

### 3-1. 켤 것 — `Literature & citations`

토글 하나만 켜면 됩니다. arXiv · Semantic Scholar · Crossref · DOI · OpenAlex 가 한 번에 열립니다.
**이게 이 랩에서 제일 중요한 스위치입니다.** 문헌 조사, 인용 분석, OpenAlex 기반 작업이 전부 여기 걸립니다.

나머지 토글(NCBI/NIH · Genomics · Proteomics · Clinical)은 꺼두셔도 됩니다. 생물 network 를
다루게 되면 그때 `Proteomics`(STRING, RCSB PDB) 를 켜세요.

`Package management` 는 기본으로 켜져 있습니다 — pip·conda·GitHub 이 여기 들어 있으니 끄지 마세요.

### 3-2. 추가할 것 — 네트워크 데이터셋

같은 화면 아래 **Allowed domains** 에 하나씩 추가합니다. 자주 쓰는 순서대로 적었으니,
위에서부터 필요한 만큼만 넣으셔도 됩니다.

```
networks.skewed.de          Netzschleuder — graph-tool 공식 데이터셋 저장소
snap.stanford.edu           SNAP
networkrepository.com
icon.colorado.edu           Index of Complex Networks
konect.cc                   KONECT
zenodo.org                  논문 부록 데이터가 제일 많이 올라오는 곳
figshare.com
osf.io
dataverse.harvard.edu
www.sociopatterns.org       대면 접촉 temporal network
```

GitHub 은 `Package management` 에 이미 들어 있어서 따로 안 넣어도 됩니다.

### 3-3. 학술지 feed 도 쓰신다면

아래 4번의 주간 digest 를 Claude 로 직접 돌리고 싶으면 이것들도 넣으세요.

```
feeds.aps.org  journals.aps.org        PRL · PRE · PRX · PRResearch · RMP
feeds.nature.com  www.nature.com
journals.plos.org
www.pnas.org
iopscience.iop.org                     J. Phys. Complexity
api.crossref.org                       Springer·AAAS 가 막을 때 쓰는 우회로
```

---

## 4. Claude Science — 랩 서버 연결 (선택)

> 데스크톱 앱 **설정 → Compute → Add SSH host** 에서 합니다.

내 노트북이 아니라 랩 서버에서 계산을 돌리게 하는 설정입니다. 큰 network 를 다루거나 GPU 가
필요할 때만 하시면 됩니다.

### 4-1. 먼저 `~/.ssh/config` 를 만들어 둡니다

**실제 주소·포트·계정은 이 문서에 적지 않습니다**(공개 레포라서요). 랩 내부에서 공유받아
아래 꺾쇠 부분을 채우세요.

```sshconfig
Host node0
    HostName <서버 주소>
    User <랩 공용 계정>
    Port <node0 포트>

# node1, node2, ... 도 같은 모양으로, Port 만 바꿔서

# 긴 계산을 돌릴 때 연결이 끊기지 않게 해주는 공통 설정
Host node0 node1 node2 node3 node26
    ServerAliveInterval 30
    ServerAliveCountMax 6
    ConnectTimeout 30
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 10m
```

`mkdir -p ~/.ssh/sockets` 를 한 번 해주세요. 그다음 `ssh node0` 이 비밀번호 없이 들어가지는지
확인합니다. 물어보면 공개키가 아직 서버에 없는 겁니다:

```bash
ssh-keygen -t ed25519          # 키가 없다면 한 번만
ssh-copy-id node0              # 노드마다 한 번씩
```

### 4-2. 앱에서 등록합니다

**Add SSH host** 화면에서 `From ~/.ssh/config` 드롭다운을 열면 방금 쓴 별칭이 보입니다. 고르세요.

- **Authentication** — 위에서 `ssh-copy-id` 를 했으면 **`Public key`** 입니다.
  `Password` 는 키를 못 쓸 때만 쓰고, 비밀번호는 저장되지 않고 최대 8시간만 메모리에 있습니다.
- **Anything Claude Science should know?** — 여기를 비워두면 Claude 가 `sbatch` 를 찾거나
  노드 사이에 파일이 따라온다고 착각합니다. 아래를 붙여넣고 본인 노드에 맞게 고치세요.

```
랩 공용 노드. Ubuntu 26.04.
스케줄러 없음 — sbatch/qsub 쓰지 말고 그냥 bash 로 실행. 긴 작업은 nohup 또는 tmux.
홈이 노드 로컬 디스크라 다른 노드와 공유되지 않음. 파일은 이 노드 안에서만 다룰 것.
pip/conda 설치 OK. 시스템 python 건드리지 말고 ~/venvs/<프로젝트> 에 venv 만들어서.
여러 명이 같이 쓰는 서버 — 기본 16 코어 이하, nice 10 붙여서.
GPU 는 nvidia-smi 로 빈 것 확인하고 CUDA_VISIBLE_DEVICES 지정.
networkx/numpy/pandas 는 있고 igraph/graph-tool 은 없음.
```

> 노드마다 코어 수·RAM·GPU 가 다릅니다. 어느 노드가 지금 한가한지는 `ssh <노드> uptime` 으로
> load average 를 보고 고르세요. 20코어 노드에서 load 가 10이면 이미 반은 차 있는 겁니다.

### 4-3. Jupyter 터널

```bash
ssh -p <포트> -L <포트번호>:localhost:<포트번호> <계정>@<서버 주소>
```

**local 포트와 remote 포트를 같은 번호로 맞추세요.** 서로 다르게 적으면 노드 두 개를 동시에
못 엽니다(로컬 포트가 겹쳐서요).

---

## 5. 주간 논문 digest (선택)

학술지 22개를 훑어서 network science 관련 신규 논문만 골라주는 스크립트가 들어 있습니다.
설치할 것 없이 python3 만 있으면 돕니다.

```bash
cd tools/ns-feed-digest
python3 ns_feed_digest.py --opml feeds.opml --out out --days 7
```

랩 서버에서 매주 자동으로 돌리는 방법은 [tools/ns-feed-digest/README.md](../tools/ns-feed-digest/README.md) 를 보세요.

읽고 싶은 학술지를 바꾸려면 `feeds.opml` 에 줄을 더하면 됩니다. Feedly 를 쓰신다면
**Organize sources → Export OPML** 로 받은 파일을 그대로 `--opml` 에 넣어도 됩니다.

---

## 잘 안 될 때

| 증상 | 이유 | 해결 |
|---|---|---|
| `/network-science-kr` 가 안 잡힘 | 세션이 스킬 목록을 시작할 때만 읽음 | 터미널·앱을 완전히 재시작 |
| 논문을 못 찾아옴 | `Literature & citations` 가 꺼져 있음 | 3-1 |
| 데이터 받다가 막힘 | 그 주소가 Allowed domains 에 없음 | 3-2 에 추가 |
| SSH host 목록이 비어 있음 | `~/.ssh/config` 에 `Host` 별칭이 없음 | 4-1 |
| 서버에서 `sbatch` 를 찾다 실패 | 스케줄러가 없는데 안 알려줌 | 4-2 의 안내문 붙여넣기 |
| 서버 파일이 안 보임 | 노드마다 홈이 따로임 | 같은 노드에서 작업하거나 `scp` |

그래도 막히면 랩 사람 아무나 붙잡고 물어보세요. 혼자 오래 붙들고 있지 않는 게 제일 빠릅니다.
