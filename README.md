# hehehe

한국어 | [English](README.en.md)

Codex가 계획·구현·검증·수정을 끝까지 맡고, Claude는 필요할 때만 독립 리뷰어로 참여하는 개발 워크플로우 플러그인입니다.

아이디어 정리부터 구현, 브라우저 테스트, 출시 전 점검까지 하나의 흐름으로 연결하며 중단된 작업은 실행 상태를 기록해 이어서 진행할 수 있습니다.

## 주요 기능

- **Codex-first 실행**: 기획, 구현, 디버깅, 테스트와 최종 판단을 Codex가 담당
- **선택적 Claude 리뷰**: 코드·보안·마이그레이션 같은 고위험 변경을 읽기 전용으로 교차 검토
- **전 과정 자동화**: 스펙 작성 → 구현 → 빌드 게이트 → 브라우저 검증 → 정리 → 문서화
- **적응형 아키텍처 게이트**: 별도의 프로젝트 점수 0~10으로 Lite·Standard·Strict를 자동 선택하고 프로필별 결합도 기준을 적용
- **프론트엔드 기본 정책**: 새 프론트엔드는 FSD와 Tailwind CSS를 기본으로 사용하며 명시적 사용자 요청을 우선
- **백엔드 데이터 정책**: 쓰기는 ORM 우선, 복잡한 조회는 Core/바인딩 SQL을 선택하며 Go는 기존 SQL 계층을 동등하게 지원
- **설치 없는 기본 관측**: 브라우저·애플리케이션·테스트 출력을 재사용하고, 백엔드 오류 코드·구조화 로그·`request_id` 연결을 검증
- **작업별 격리**: 작업 브랜치와 Git worktree를 재사용·생성하고 포트·로그·Compose·개발 DB 식별자를 작업별로 분리
- **서브에이전트 병렬 해결**: 독립 작업을 Codex 서브에이전트에 분배하고 메인 Codex가 통합·검증
- **실제 브라우저 테스트**: 인앱 브라우저로 클릭, 입력, 네트워크·콘솔 오류와 반응형 화면 확인
- **실행 상태 복구**: `.hehehe/runs/`에 진행 상태를 보존하고 중단 지점부터 재개
- **저장소 지식 시스템**: 짧은 `AGENTS.md`, 문서 인덱스, 아키텍처 지도와 소스 지문으로 프로젝트 지식을 자동 생성·동기화·검증
- **드리프트·가비지 컬렉션**: 주기적 품질 감사로 변경량·크기·구조 위반을 찾고, 삭제 근거를 검증한 뒤 한 가지 대상만 유지보수 변경이나 PR로 처리
- **CI·PR 자율 루프**: 정확한 PR head SHA를 기준으로 리뷰 피드백과 CI 실패를 수정·재검증하고, 허용된 범위에서 ready 또는 merge 상태까지 진행
- **설치 진단**: hehehe 설치, Codex, 선택적 Claude와 프로젝트 상태를 읽기 전용으로 점검
- **UI 설계 지원**: 제품 성격에 맞는 UI 방향, 디자인 시스템과 구현 흐름 제공

전체 스킬 목록은 [USAGE.md](USAGE.md)에서 확인할 수 있습니다.

## 요구 사항

- Node.js 20 이상
- Codex CLI
- Claude CLI는 선택 사항이며 독립 교차 리뷰를 요청할 때만 필요

## 빠른 시작

### 모든 프로젝트에서 사용

```bash
npx harness-hehehe install --global
```

### 현재 프로젝트에서만 사용

```bash
npx harness-hehehe install --project .
```

설치 후 Codex를 재시작하거나 새 스레드를 시작한 다음 스킬을 호출합니다.

```text
$hehehe:full-resolve 사용자 프로필 편집 기능을 구현하고 검증해줘
```

## 설치 범위

| 범위 | 명령 | 플러그인 위치 | 동작 |
|---|---|---|---|
| 사용자 전역 | `npx harness-hehehe install --global` | `~/plugins/hehehe` | 개인 마켓플레이스 등록 후 자동 활성화 |
| 현재 프로젝트 | `npx harness-hehehe install --project .` | `<project>/.agents/skills/hehehe-*` | 해당 프로젝트에서만 기본 로드 |
| 지정 프로젝트 | `npx harness-hehehe install --project <path>` | `<path>/.agents/skills/hehehe-*` | 지정한 프로젝트에서만 기본 로드 |

전역 설치는 `~/.agents/plugins/marketplace.json`의 다른 플러그인을 보존하고 `hehehe` 항목만 추가하거나 갱신합니다. 프로젝트 설치는 Codex CLI와 데스크톱 앱이 공통으로 탐색하는 `.agents/skills`에 `$hehehe:*` 스킬을 직접 배치하며 기존 프로젝트 스킬을 보존합니다. 이전 버전의 프로젝트 마켓플레이스 설치가 있으면 `hehehe` 항목만 마이그레이션합니다.

Windows와 macOS/Linux 모두 같은 명령을 사용합니다.

```bash
npx harness-hehehe install --project "D:\work\my-app"
npx harness-hehehe install --project /work/my-app
```

### CLI를 전역 설치

매번 `npx`를 사용하지 않으려면 설치 프로그램 자체를 전역으로 설치합니다.

```bash
npm install -g harness-hehehe
harness-hehehe install --global
harness-hehehe install --project .
```

전역 설치 후 실행 명령은 패키지명과 동일한 `harness-hehehe`입니다.

## 대표 워크플로우

### 아이디어에서 구현까지

```text
$hehehe:ideate 관리자 주문 처리 아이디어를 MVP 스펙으로 정리해줘
$hehehe:feature-spec 주문 상태 변경 기능의 인수 조건을 작성해줘
$hehehe:full-resolve 스펙을 구현하고 빌드와 브라우저 검증까지 완료해줘
$hehehe:frontend-architecture 프론트엔드 기능을 FSD와 Tailwind 기준으로 설계해줘
$hehehe:backend-architecture 백엔드 책임 분리와 ORM/SQL 선택을 검토해줘
$hehehe:observability API 오류 응답과 백엔드 로그를 구조화하고 검증해줘
$hehehe:resume 주문 오류 개선 작업의 작업공간과 실행 상태를 준비해줘
$hehehe:repository-knowledge
$hehehe:preflight 출시 가능한 상태인지 최종 확인해줘
```

`$hehehe:repository-knowledge`는 모드를 생략하면 초기화, 동기화, 안전한 수정과 신선도 재검사를 모두 자동 수행합니다. 필요할 때 `init`, `sync`, `check`, `status` 모드를 명시할 수 있습니다.

### 버그 해결과 리뷰

```text
$hehehe:resolve 로그인 후 리다이렉트가 반복되는 원인을 찾아서 고쳐줘
$hehehe:subagent-resolve 여러 모듈에 걸친 인증 변경을 서브에이전트로 나눠 구현하고 통합해줘
$hehehe:review 현재 변경을 버그와 회귀 위험 중심으로 검토해줘
$hehehe:team-review 인증 변경을 독립 관점까지 포함해 검토해줘
$hehehe:maintain-codebase check 저장소 드리프트와 정리 대상을 점검해줘
$hehehe:pr-loop ready PR 42의 리뷰와 CI 실패를 처리해서 병합 준비 상태로 만들어줘
```

### UI 설계와 실제 화면 검증

```text
$hehehe:design-ui 분석 대시보드의 UI 방향을 제안해줘
$hehehe:implement-ui 선택한 방향으로 기존 프론트엔드에 구현해줘
$hehehe:browser-validate 데스크톱과 모바일에서 주요 흐름을 직접 테스트해줘
```

`browser-validate`는 코드를 읽거나 빌드만 확인하는 테스트가 아닙니다. 인앱 브라우저로 실제 페이지를 열고 클릭·입력·이동을 수행하며 콘솔 오류, 실패한 네트워크 요청과 레이아웃 회귀를 확인합니다.

### 진단과 작업 재개

```text
$hehehe:doctor 전역 설치와 현재 프로젝트 상태를 진단해줘
$hehehe:resume 중단된 작업공간과 hehehe 실행을 이어서 진행해줘
```

`doctor`는 파일을 수정하지 않고 `PASS`, `DEGRADED`, `BLOCKED` 상태와 근거를 보고합니다. `resume`은 작업 브랜치·worktree·로컬 런타임 식별자와 저장된 실행 목표를 함께 대조한 후 다음 단계부터 진행합니다.

## CLI 명령

```text
harness-hehehe install --global [--dry-run]
harness-hehehe install --project [path] [--dry-run]
harness-hehehe uninstall --global [--dry-run]
harness-hehehe uninstall --project [path] [--dry-run]
harness-hehehe profile [path] [--json] [--write]
  [--config path] [--allow-downgrade]
```

### 아키텍처 프로필

비단순 애플리케이션 작업에서는 보안·데이터 위험, 도메인 복잡도, 연동 복잡도, 운영 위험, 협업 압력을 각각 `0~2`로 평가합니다.

| 프로젝트 점수 | 프로필 | 결합도 통과 | 개선 또는 사유 기록 | 실패 |
|---|---|---|---|---|
| `0-3` | Lite | `0-4` | `5-6` | `7-10` |
| `4-6` | Standard | `0-3` | `4-5` | `6-10` |
| `7-10` | Strict | `0-2` | `3-4` | `5-10` |

프로젝트 점수와 변경 단위의 결합도 점수는 서로 다른 값입니다. 구조적 경계 위반은 모든 프로필에서 차단합니다. 다음 명령으로 보고서를 생성하거나 갱신합니다.

```bash
npx harness-hehehe profile . --write
```

자동 판정으로 알 수 없는 비즈니스 맥락이나 고정 프로필은 `.hehehe/architecture-policy.json`에 선언할 수 있습니다.

변경 없이 설치 경로와 범위만 확인할 수 있습니다.

```bash
npx harness-hehehe install --global --dry-run
npx harness-hehehe install --project . --dry-run
```

설치기는 번들 매니페스트와 스킬 frontmatter를 먼저 검증합니다. 전역 플러그인과 프로젝트 스킬은 임시 경로에서 새 번들을 준비한 뒤 교체하며, 기존 마켓플레이스나 프로젝트 스킬을 조용히 덮어쓰지 않습니다.

## 업데이트

같은 설치 명령을 다시 실행하면 현재 설치를 최신 배포본으로 교체합니다.

```bash
npx harness-hehehe@latest install --global
npx harness-hehehe@latest install --project .
```

업데이트 후 Codex를 재시작하거나 새 스레드를 시작하세요.

## 제거

```bash
npx harness-hehehe uninstall --global
npx harness-hehehe uninstall --project .
```

기존 마켓플레이스의 다른 플러그인은 유지하고 `hehehe` 항목과 해당 설치 경로만 제거합니다.

## 작업 상태 파일

장기 실행 워크플로우는 프로젝트의 `.hehehe/`에 상태와 검증 결과를 저장할 수 있습니다.

```text
.hehehe/done-criteria.md
.hehehe/implementation-spec.md
.hehehe/checks.md
.hehehe/final-report.md
.hehehe/current.json
.hehehe/runs/<run-id>/state.json
```

## 언어 설정

hehehe 스킬은 내부적으로 영어로 추론하고 사용자에게 보내는 최종 답변은 한국어로 작성하도록 구성되어 있습니다. 이 규칙은 `$hehehe:...` 스킬을 사용할 때 적용됩니다.

일반 Codex 대화에도 같은 규칙을 적용하려면 사용자 전역 `AGENTS.md`에 추가합니다.

```markdown
# Global Instructions

- Reason internally in English.
- Always write the final response to the user in Korean.
```

## 문제 해결

### 설치했는데 스킬이 보이지 않음

1. 프로젝트 설치는 출력의 `Skills target`과 `.agents/skills/hehehe-review/SKILL.md`를 확인합니다.
2. 전역 설치는 출력의 `Plugin target`과 대상의 `.codex-plugin/plugin.json`을 확인합니다.
3. 전역 설치는 `codex plugin list`에서 `hehehe`가 활성화됐는지 확인합니다.
4. Codex를 프로젝트 루트에서 재시작하거나 새 스레드를 시작합니다.

### 설치 상태가 의심됨

```text
$hehehe:doctor 현재 설치와 프로젝트 상태를 진단해줘
```

### 설치 범위가 헷갈림

- 모든 프로젝트: `--global`
- 현재 프로젝트만: `--project .`
- 지정 프로젝트만: `--project <path>`

## 개발 및 검증

```bash
npm test
npm run validate
npm pack --dry-run
```

저장소 구조:

```text
hehehe/
  bin/hehehe.mjs
  lib/installer.mjs
  plugins/hehehe/
    .codex-plugin/plugin.json
    skills/
    templates/
  tests/
  package.json
  README.md
  README.en.md
  USAGE.md
```

## 자동 배포

`main` 브랜치에 PR이 병합되면 GitHub Actions가 검증을 실행한 뒤 npm에 자동 배포합니다. PR에는 아직 npm에 배포되지 않은 새 버전을 `package.json`과 `plugins/hehehe/.codex-plugin/plugin.json`에 동일하게 지정해야 합니다. npm Trusted Publishing에는 GitHub 저장소 `d0nghee/harness-hehehe`와 워크플로 파일 `publish.yml`을 등록합니다.

## 라이선스

MIT
