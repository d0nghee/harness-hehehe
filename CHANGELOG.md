# 변경 기록

실제 npm 배포일 기준의 변경 이력입니다. 버전별 게시글은 [GitHub Releases](https://github.com/d0nghee/harness-hehehe/releases)에서 확인할 수 있습니다.

## 미배포 · 문서 및 배포 운영

- README 하단에 Releases와 전체 변경 기록 링크를 추가합니다.
- 배포 검증은 유지하고, 이미 npm에 등록된 버전의 중복 배포만 건너뛰도록 개선합니다. 레지스트리 조회 오류는 실패로 처리합니다.

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
