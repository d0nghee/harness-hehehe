# hehehe 사용 매뉴얼

hehehe는 Codex-first 개발 워크플로우 플러그인입니다.

핵심 역할은 다음과 같습니다.

```text
Codex: 요구사항 정리, 구현, 수정, 검증, 최종 판단
Claude: 선택적 독립 리뷰, 보안 검토, 반박/챌린지 리뷰
```

## 기본 사용법

Codex에서 스킬 이름을 직접 호출합니다.

```text
$hehehe:<skill-name> 요청 내용
```

예시:

```text
$hehehe:ideate 쇼핑몰 관리자 주문 처리 기능을 MVP 범위로 정리해줘
```

```text
$hehehe:full-resolve .hehehe/implementation-spec.md 기준으로 구현하고 빌드까지 확인해줘
```

```text
$hehehe:preflight 현재 구현이 done criteria를 만족하는지 출시 전 점검해줘
```

```text
$hehehe:review 이번 변경사항을 버그와 회귀 위험 중심으로 리뷰해줘
```

```text
$hehehe:doctor 현재 hehehe 설치와 프로젝트 설정을 진단해줘
```

```text
$hehehe:resume 중단된 hehehe 실행을 이어서 진행해줘
```

## 주요 워크플로우

아이디어에서 구현까지 한 번에 진행할 때:

```text
$hehehe:ideate
$hehehe:feature-spec
$hehehe:full-resolve
$hehehe:preflight
```

이미 구현된 변경을 점검할 때:

```text
$hehehe:review
$hehehe:evaluate
$hehehe:browser-validate
$hehehe:update-docs
```

주기적 유지보수와 PR 후속 처리를 할 때:

```text
$hehehe:maintain-codebase check
$hehehe:maintain-codebase pr
$hehehe:pr-loop ready
$hehehe:pr-loop merge
```

UI 작업을 설계하고 구현할 때:

```text
$hehehe:design-ui
$hehehe:design-system
$hehehe:implement-ui
```

복잡한 버그를 고칠 때:

```text
$hehehe:resolve
$hehehe:team-resolve
```

## 포함된 스킬

### 전체 파이프라인

- `hehehe:hehehe`: 아이디어, 버그, UI 요청을 Codex-first 자동 개발 흐름으로 처리
- `hehehe:full-resolve`: 기능이나 넓은 변경을 작업공간 준비부터 구현, 아키텍처·빌드 게이트, 브라우저·관측 검증, 리뷰, 수정 루프, 문서·지식 동기화까지 종단간 처리
- `hehehe:preflight`: 로드맵, done criteria, 요청 동작 기준 출시 전 점검
- `hehehe:doctor`: Codex, Claude, hehehe 설치, 프로젝트 상태를 읽기 전용으로 진단
- `hehehe:resume`: 작업 ID에 맞는 브랜치·Git worktree·로컬 런타임 식별자와 `.hehehe/runs/` 실행 상태를 함께 준비·확인·재개·완료·명시적 폐기

### 기획과 스펙

- `hehehe:discover-product`: 새 앱, 기능, 워크플로우를 제품 요구사항으로 정리
- `hehehe:product-spec`: 제품 수준 스펙 작성 또는 업데이트
- `hehehe:feature-spec`: 기능 수준 구현 스펙과 검증 기준 작성
- `hehehe:ideate`: 거친 아이디어를 로드맵, done criteria, 구현 스펙으로 변환
- `hehehe:recommend-features`: 코드와 스펙 상태를 보고 다음 고가치 기능 추천
- `hehehe:repository-knowledge`: 모드 생략 시 저장소 지식 시스템을 자동 초기화·동기화·검증하고, `init`·`sync`·`check`·`status` 모드도 제공

### 구현과 검증

- `hehehe:architecture-metrics`: 프로젝트를 Lite·Standard·Strict로 산정하고 프론트엔드·백엔드 변경 결합도를 프로필별 기준과 구조적 차단 조건으로 평가
- `hehehe:frontend-architecture`: FSD와 Tailwind 기본 정책으로 프론트엔드 책임·상태·API 경계를 설계·검토
- `hehehe:backend-architecture`: 백엔드 책임 경계, 프로필별 결합도 기준, ORM과 SQL 사용 위치를 설계·검토
- `hehehe:observability`: 별도 관측 스택 없이 브라우저·API·백엔드 실행 근거와 구조화 오류·로그·`request_id` 연결을 적용·검증하며, 명시적 `full` 모드에서만 Docker 관측 스택 사용
- `hehehe:resolve`: 단일 버그·회귀·실패 체크를 재현하고 원인을 추적해 최소 범위를 수정하고 집중 검증
- `hehehe:subagent-resolve`: 여러 독립 작업을 Codex 서브에이전트로 병렬 처리하고 메인 Codex가 통합·검증
- `hehehe:team-resolve`: 복잡한 버그를 Codex 주도와 선택적 Claude 비평으로 해결
- `hehehe:evaluate`: 명시 기준에 따라 구현을 평가
- `hehehe:browser-validate`: 웹 UI 또는 로컬 앱 워크플로우를 브라우저로 검증
- `hehehe:clean`: 구현 후 코드 위생 정리
- `hehehe:maintain-codebase`: 주기적 저장소 드리프트 감사, 삭제 근거 검증, 한 가지 대상의 제한된 리팩터링과 유지보수 PR 준비
- `hehehe:pr-loop`: 정확한 PR head SHA를 기준으로 리뷰·CI 실패를 수정하고 허용된 ready 또는 merge 상태까지 반복
- `hehehe:update-docs`: 완료된 코드 변경과 관련 문서 동기화

### 리뷰

- `hehehe:review`: 버그, 회귀, 보안, 테스트 누락 중심의 집중 리뷰
- `hehehe:team-review`: Codex 주도 리뷰와 선택적 Claude 독립 리뷰를 결합

### UI/UX

- `hehehe:design-ui`: 제품 화면이나 워크플로우의 UI 방향 생성
- `hehehe:team-design-ui`: 여러 디자인 관점으로 UI 콘셉트 생성 후 Codex가 통합
- `hehehe:design-system`: 선택된 UI 방향을 구현 가능한 디자인 시스템으로 정리
- `hehehe:implement-ui`: 기존 프론트엔드 스택으로 UI 구현

## 작업 파일

hehehe 워크플로우는 프로젝트 안에 `.hehehe/` 폴더를 사용할 수 있습니다.

자주 쓰는 파일:

```text
.hehehe/done-criteria.md
.hehehe/implementation-spec.md
.hehehe/checks.md
.hehehe/claude-review.md
.hehehe/final-report.md
.hehehe/current.json
.hehehe/knowledge.json
.hehehe/runs/<run-id>/state.json
```

유지 대상 저장소의 장기 지식은 루트 `AGENTS.md`, `docs/README.md`, `docs/architecture/overview.md`를 공통 기준으로 사용합니다. 실제로 존재하는 관심사만 세부 문서로 추가하며 빈 문서를 기계적으로 만들지 않습니다.

템플릿은 플러그인 번들에 들어 있습니다.

```text
plugins/hehehe/templates/done-criteria.md
plugins/hehehe/templates/implementation-spec.md
```

## 운영 원칙

- Codex가 주 실행자입니다.
- Claude는 선택적 보조 리뷰어입니다.
- Claude 결과는 조언이며, Codex가 코드와 테스트로 다시 확인합니다.
- 구현, 수정, 최종 판단은 Codex가 맡습니다.
- 작은 작업은 Claude를 호출하지 않고 Codex만으로 처리할 수 있습니다.

## 완료 게이트와 검증 정책

통합 전달을 요청했거나 저장소에 설정한 경우에는 메인 에이전트가 변경을 합치고 `resume`의 `delivery.mjs prepare`로 고정된 확인 경로에서 전체 검증합니다. `awaiting_approval`은 main 반영 전이며, 사용자 승인 후 정확한 후보·main·요청 ID를 대조해 `merge`하고 같은 폴더가 main인지 확인합니다. 서브에이전트별 테스트나 병합을 사용자에게 떠넘기지 않습니다. 설정·첫 도입·복구는 [통합 전달 안내](plugins/hehehe/skills/resume/references/integration-delivery.md)를 참고하세요.

`hehehe:resume`의 `verify`는 사람이 검토한 커밋의 `.hehehe/verification-policy.json`에서 필수 검사를 읽습니다. 외부 실행 환경에서 `HEHEHE_VERIFICATION_BASE`에 해당 커밋의 전체 SHA를 지정해야 합니다. AI가 작성한 완료 기준이나 `PASS` 문구는 승인 근거가 아닙니다.

```text
node <resume>/scripts/run-state.mjs verify --project <repository-root> --json
node <resume>/scripts/run-state.mjs complete --project <repository-root> --json
```

검사 실패·미실행·시간 초과·허용되지 않은 건너뛰기·증거 누락·유효기간 경과·검사 후 코드나 HEAD 변경은 완료를 차단합니다. 기존 필수 테스트와 실행 설정을 바꿔야 한다면 독립적인 검토가 필요합니다. 관리자가 정확히 검토한 커밋을 외부 `HEHEHE_VERIFICATION_APPROVED_HEAD`로 지정할 수 있지만, 그 실행도 기존 기준 커밋의 필수 검사를 사용합니다.

최초 도입과 정책 변경 승인, CI 필수 검사 설정은 [검증 정책 안내](plugins/hehehe/skills/resume/references/verification-policy.md)를 따르세요. 신뢰 기준이 없는 구버전 실행에는 자동 완료 예외를 주지 않습니다. 로컬 무결성 검사는 같은 계정의 무제한 파일 접근까지 통제하지 못하므로 중요한 병합 조건은 CI 및 저장소 보호 규칙으로 강제해야 합니다.
