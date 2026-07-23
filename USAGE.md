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
$hehehe:auto-resolve .hehehe/implementation-spec.md 기준으로 구현하고 빌드까지 확인해줘
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
$hehehe:auto-resolve
$hehehe:preflight
```

이미 구현된 변경을 점검할 때:

```text
$hehehe:review
$hehehe:evaluate
$hehehe:browser-validate
$hehehe:update-docs
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
- `hehehe:auto-resolve`: 구현, 빌드 게이트, 브라우저 검증, 선택적 Claude 리뷰, 수정 루프, 문서 정리
- `hehehe:preflight`: 로드맵, done criteria, 요청 동작 기준 출시 전 점검
- `hehehe:doctor`: Codex, Claude, hehehe 설치, 프로젝트 상태를 읽기 전용으로 진단
- `hehehe:resume`: `.hehehe/runs/`에 기록된 활성 실행 상태를 확인하고 이어서 진행

### 기획과 스펙

- `hehehe:discover-product`: 새 앱, 기능, 워크플로우를 제품 요구사항으로 정리
- `hehehe:product-spec`: 제품 수준 스펙 작성 또는 업데이트
- `hehehe:feature-spec`: 기능 수준 구현 스펙과 검증 기준 작성
- `hehehe:ideate`: 거친 아이디어를 로드맵, done criteria, 구현 스펙으로 변환
- `hehehe:recommend-features`: 코드와 스펙 상태를 보고 다음 고가치 기능 추천

### 구현과 검증

- `hehehe:resolve`: 단일 버그나 실패 체크를 조사하고 수정
- `hehehe:team-resolve`: 복잡한 버그를 Codex 주도와 선택적 Claude 비평으로 해결
- `hehehe:evaluate`: 명시 기준에 따라 구현을 평가
- `hehehe:browser-validate`: 웹 UI 또는 로컬 앱 워크플로우를 브라우저로 검증
- `hehehe:browser-tool-test`: 인앱 브라우저로 로컬 경로와 사용자 흐름을 직접 테스트
- `hehehe:clean`: 구현 후 코드 위생 정리
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
.hehehe/runs/<run-id>/state.json
```

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
