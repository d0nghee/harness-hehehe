# 변경 기록

실제 npm 배포일 기준의 변경 이력입니다. 버전별 게시글은 [GitHub Releases](https://github.com/d0nghee/harness-hehehe/releases)에서 확인할 수 있습니다.

## [0.4.0](https://github.com/d0nghee/harness-hehehe/releases/tag/v0.4.0) · 2026-11-26

하네스를 간소화하고, 검증 정책이 없는 저장소에서도 실행을 완료할 수 있게 한 릴리스입니다. 이전 버전의 전역 설치본에서 그대로 업그레이드할 수 있습니다.

### 업그레이드 시 달라지는 점

- **삭제된 스킬 7개**: `team-resolve`·`team-review`·`team-design-ui`·`evaluate`·`product-spec`·`discover-product`·`recommend-features`가 없어졌습니다. 각각 `subagent-resolve`·`review`·`design-ui`·`ideate`가 같은 일을 맡습니다. 삭제된 이름을 직접 호출하던 경우 흡수된 스킬을 사용하세요.
- **완료 게이트가 저장소별 선택형이 됩니다**: 0.3.14에서는 검증 정책이 없는 저장소에서 `complete`가 항상 실패했습니다. 이제 `.hehehe/verification-policy.json`을 도입했거나(작업 트리 또는 HEAD 이력) `HEHEHE_VERIFICATION_BASE`가 지정된 저장소에서만 게이트를 강제합니다. 그 외에는 `verify`가 `ungated`를 보고하고 `complete`가 `verification.mode: "ungated"`로 완료를 기록합니다. 게이트가 적용되는 저장소의 동작은 그대로이며, 도입한 정책을 작업 트리나 커밋에서 삭제해도 게이트는 풀리지 않습니다.
- **번들 디자인 참고 문서가 16개로 줄어듭니다**: `design-ui`가 직접 추천하는 stripe, figma, apple, slack, airbnb, github, linear, vercel, notion, netflix, spotify, steam, paypal, coinbase, wise, revolut만 포함합니다. 그 외 브랜드는 원본 저장소(`github.com/Khalidabdi1/design-ai`)에서 필요할 때 찾아 쓰거나 가장 가까운 번들 문서로 대체합니다.

### 새 기능

- **세션 간 경험 기억**: `experience-memory` 스킬이 선별한 문제·원인·해결 경험을 출처와 함께 실행별 `experience.json`에 기록하고, 다음 실행의 `resume init`에서 관련 기록을 회상합니다. 별도 색인·DB·추가 런타임 없이 기록 파일을 직접 읽어 검색합니다. 완료된 실행의 기록만 대상이며, 내용 변경·만료·조상이 아닌 커밋·출처 불일치는 회상에서 제외합니다. 기억은 참고 자료이고 승인·검증 게이트를 대신하지 않습니다. 전체 대화나 로그는 수집하지 않습니다.
- **Claude Code용 판**: `npx harness-hehehe install --claude` 한 줄로 Claude Code에 설치합니다. 같은 스킬에서 역할을 뒤집은 판으로, Claude가 주 실행자이고 Codex는 선택적 읽기 전용 리뷰어입니다. 설치기가 패키지의 Codex 원본에서 Claude 판을 생성해 `~/.claude/hehehe-marketplace`에 두고 Claude CLI로 등록하며, Claude Code 설정 파일을 직접 고치지 않습니다. 제거는 `npx harness-hehehe uninstall --claude`입니다. Codex 설치 진단용 `doctor` 스킬은 Claude 판에서 제외합니다.
- **승인 기반 릴리스 절차**: main 푸시의 자동 배포를 분리하고, 검토된 릴리스 정책에 따른 계획·고정 패키지 준비·필수 검증·정확한 배포 승인을 연결합니다. npm 파일·버전 태그·GitHub Release를 확인한 뒤 완료하며, 일부 단계 실패는 같은 후보로 재개합니다.
- **검증 기준 승격과 1인 운영 지침**: 별도 승인 후 검증 기준을 승격하는 절차와 원격 보호 점검·전달 지침을 추가합니다. 병합 후 만료된 검증은 기존 기준으로 재실행할 수 있습니다.

### 간소화

- `hehehe` 진입 스킬은 운영 원칙과 스킬 안내만 남기고, `full-resolve`는 16단계를 10단계로 묶습니다. 검증·전달 규칙은 `resume`에만 두고 다른 스킬은 이를 참조합니다.
- `resume` 스킬은 검증·통합 전달·릴리스 참고 문서를 해당 기능을 쓰는 저장소에서만 읽도록 안내합니다.
- 스킬은 31개에서 24개로, npm 패키지는 약 723KB에서 약 215KB로 줄었습니다.

### 설치와 안전성

- 전역 설치·제거 전 소유 표식과 구버전 등록·번들 구성을 확인하여 무관한 동명 폴더, Git 체크아웃과 연결 경로를 보존합니다. 이전 릴리스가 배포했다가 제거한 파일이 남은 설치본도 관리 대상으로 인식합니다.
- 같은 홈의 전역 설치·제거에 공통 잠금을 적용하여 폴더와 등록 정보가 서로 다른 상태로 남는 동시 실행을 차단합니다.
- 설치 설정 JSON을 원자 교체하고, 폴더 갱신·복원 실패 시 원본 백업과 복구 경로를 보존합니다.
- 이전 프로젝트 플러그인 폴더를 삭제하는 마이그레이션·제거 전에 경로와 전체 삭제를 확인합니다. 취소·입력 종료·비대화형 실행은 변경을 중단하며, 자동 실행은 사용자가 승인한 정확한 절대 경로를 지정해야 합니다.
- 작업명 전체의 해시와 저장소 공통 식별자로 작업 충돌 및 재개 위치에 따른 포트·DB 식별자 변경을 방지합니다. 기존 작업 브랜치를 다시 체크아웃할 때 실제 시작 HEAD와 요청한 기준 커밋을 구분해 보고합니다.
- 소스 상위 경로의 junction을 차단하고, 승인 후 main 갱신 전 복구 저널을 기록합니다. 확인 후보의 폴더·브랜치 변경 전 준비 기록을 남겨 중단된 `prepare`를 같은 후보와 요청 ID로 복구합니다.
- `doctor`가 캐시의 실제 파일을 검사하고 현재 computer-use 브라우저 공급 도구를 진단합니다. 디스크 설치 여부와 실제 도구 실행 여부를 구분합니다.
- 문서 지문에서 UTF-8 텍스트의 CRLF/LF 차이를 정규화하고, 바이너리·실제 내용 변경 감지는 유지합니다.
- npm 패키지에 CHANGELOG.md를 포함하고, README 하단에 Releases와 전체 변경 기록 링크를 추가합니다.

### 이 저장소의 운영

- 검증 정책의 보호 경로에서 `tests/**`와 `package.json`을 뺍니다. 테스트를 추가·수정하는 일반 PR은 별도 승인 변수 없이 필수 검사만으로 판정됩니다. 검증·릴리스 정책, `scripts/**`, 워크플로우, 게이트 구현(`resume/scripts/**`)은 계속 보호하며, 테스트 대량 삭제를 막기 위해 최소 실행 테스트 수를 250으로 둡니다.

## [0.3.14](https://github.com/d0nghee/harness-hehehe/releases/tag/v0.3.14) · 2026-10-22

- **신뢰 기준에 따른 완료 게이트**: 관리자가 승인한 기준 커밋의 필수 검사를 실행하고 실패·미실행·만료·검사 후 코드 변경 시 완료를 차단합니다.
- **고정 확인 폴더와 승인 후 main 반영**: 메인 에이전트가 작업을 통합·검증하고, 사용자가 승인한 정확한 후보를 같은 확인 폴더의 main에 반영합니다.
- **검증 근거 보호**: 보호된 테스트·검사 명령·정책의 변경에는 별도 승인이 필요하며, 완료·통합 절차의 회귀 테스트를 추가했습니다.
- 한국어·영문 README에 완료 게이트와 통합 전달 절차를 정리했습니다.

## [0.3.13](https://github.com/d0nghee/harness-hehehe/releases/tag/v0.3.13) · 2026-07-28

- **아키텍처 기준 확장**: Lite·Standard·Strict 프로필과 프론트엔드 FSD·Tailwind, 백엔드 ORM·SQL 책임 경계를 도입했습니다.
- **개발 흐름 확장**: 전체 구현과 서브에이전트 통합, 작업공간 격리, 브라우저 검증·관측, 저장소 지식 관리 흐름을 추가했습니다.
- 코드베이스 유지보수·PR 처리 스킬과 영문 README를 추가했습니다.

## [0.3.3](https://github.com/d0nghee/harness-hehehe/releases/tag/v0.3.3) · 2026-07-23

- **프로젝트 설치 개선**: `.agents/skills`에 `hehehe:*` 스킬을 설치하고 기존 프로젝트 스킬을 보존하도록 개선했습니다.
- 설치 잠금·트랜잭션 복구·스킬 목록 검증을 강화하고 설치 진단을 보완했습니다.

## [0.3.1](https://github.com/d0nghee/harness-hehehe/releases/tag/v0.3.1) · 2026-07-23

- **첫 npm 배포**: `harness-hehehe` CLI로 전역·프로젝트 설치와 제거를 제공했습니다.
- 실행 상태를 기록하고 중단된 작업을 이어가는 기본 흐름을 도입했습니다.
