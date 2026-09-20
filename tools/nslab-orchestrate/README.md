# nslab — 공용 노드 오케스트레이션

랩 서버는 여러 명이 **같은 계정으로** 씁니다. `ps` 로 봐도 누구 작업인지 구분이 안 되고,
아무 노드에나 얹으면 남이 며칠째 돌리던 job 을 느리게 만듭니다.

`nslab` 은 그 판단을 대신 해 줍니다. 지금 어느 노드가 한가한지 보고, 규칙대로 고르고,
**정해진 CPU 범위 안에서만** 공손하게 실행합니다.

```bash
./nslab status                          # 전 노드 상태
./nslab pick --cores 12 --ram 32        # 어디서 돌릴지 판정만
./nslab run --cores 8 -- python sim.py  # 골라서 실행
./nslab jobs                            # 누가 뭘 돌리는 중인지
```

표준 라이브러리만 씁니다. 노드는 `~/.ssh/config` 의 Host 별칭으로 찾고,
`NSLAB_NODES=a,b,c` 로 바꿀 수 있습니다.

## CPU 할당 — 랩 규칙

노드마다 **쓸 수 있는 CPU 번호가 정해져 있습니다.** 앞쪽은 시스템·GUI 몫이고, 뒤쪽은
다른 사람이 쓰도록 비워 둡니다.

| 노드 | 전체 CPU | 할당 범위 | 폭 |
|---|---|---|---|
| node0 | 0–19 | **2–17** | 16 |
| node1 | 0–7 | **2–3** | 2 |
| node2 | 0–19 | **2–15** | 14 |
| node3 | 0–19 | **2–11** | 10 |
| node26 | 0–23 | **5–19** | 15 |

`nslab run` 은 `taskset -c <범위>` 로 프로세스를 여기 묶습니다. 할당 폭보다 많은 코어를
요청하면 그 노드는 후보에서 빠집니다(예: node1 에 `--cores 8` 은 불가).

직접 실행할 때도 같은 규칙을 지켜 주세요:

```bash
taskset -c 5-19 nice -n 10 python sim.py
```

범위가 바뀌면 `nslab` 의 `CPU_ALLOC` 표를 고치고 커밋해 주세요. 그게 랩의 정본입니다.

## 우선도 판정 규칙

`pick` 은 아래 순서로 거르고 점수를 매깁니다. 왜 그 노드인지 항상 이유를 같이 출력합니다.

1. **탈락** — 할당 CPU 폭 < 요청 코어 / 여유 코어 부족 / 여유 RAM 부족 / 쓸 GPU 부족
   - 여유 코어 = 전체 코어 − `load5` (1분 평균은 방금 끝난 작업에 속기 쉬워 5분을 씁니다)
   - 쓸 수 있는 GPU = utilization 20% 미만이면서 사용 메모리 2GB 미만
2. **가점** — 남는 코어·RAM 이 많을수록, (GPU 작업이면) 빈 GPU 가 많을수록
3. **감점** — CPU 작업이 GPU 노드를 차지하면 GPU 장수만큼 감점
   (GPU 쓸 사람이 갈 데가 없어집니다)
4. **감점** — 장시간 CPU 점유 프로세스가 있거나 동시 사용자가 있으면

## 공손한 실행 — `run` 이 자동으로 붙이는 것

- `taskset -c <할당 범위>` — 정해진 CPU 밖으로 안 나갑니다
- `nice -n 10` — 남의 작업이 먼저 가도록 양보합니다
- `OMP_NUM_THREADS` · `OPENBLAS_NUM_THREADS` · `MKL_NUM_THREADS` · `NUMEXPR_NUM_THREADS`
  — numpy/scipy 가 몰래 전 코어를 쓰는 걸 막습니다. **이게 제일 자주 하는 실수입니다.**
- `CUDA_VISIBLE_DEVICES` — GPU 작업은 빈 GPU 만, CPU 작업은 GPU 를 아예 안 잡습니다
- `nohup` + 로그 — ssh 가 끊겨도 계속 돕니다 (`~/nslab-logs/<이름>.log`)
- claim 파일 — 누가·언제·무슨 명령을 띄웠는지 `~/nslab-jobs/` 에 남깁니다.
  공용 계정이라 이게 없으면 서로 추적이 안 됩니다.

## 예시

```bash
# 시뮬레이션을 12코어로, 결과는 로그로
./nslab run --cores 12 --ram 32 --name percolation --workdir ~/proj \
    -- python3 run_percolation.py --N 100000

# GPU 2장 필요한 학습
./nslab run --cores 4 --gpu 2 --gpu-ram 16 -- python3 train.py

# 계획만 보고 실행은 안 함
./nslab run --cores 8 --dry-run -- python3 sim.py
```

로그 보기 / 중단 명령은 `run` 이 끝날 때 같이 알려줍니다.

## 한계

- 예약·큐가 아닙니다. 두 사람이 동시에 `pick` 하면 같은 노드를 고를 수 있습니다.
  띄우기 전에 `nslab jobs` 를 한 번 보세요.
- `nslab run` 으로 띄운 작업만 `jobs` 에 보입니다. 직접 `ssh` 로 띄운 건 안 보이니
  `status` 의 load 도 같이 확인하세요.
- Slurm 이 node2 에 설치돼 있지만 controller 가 없어 동작하지 않습니다. 언젠가 제대로
  세팅되면 이 도구는 필요 없어집니다.
