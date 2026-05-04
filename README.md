# hehehe

hehehe는 Codex를 메인 개발 에이전트로 쓰고, Claude는 보조 리뷰어/비판자/보안 검토자 역할로 두는 Codex 플러그인입니다.

원본 devlyn 워크플로우를 반전한 구조입니다.

```text
Codex = 계획, 구현, 검증, 수정, 최종 판단
Claude = 선택적 독립 평가, challenge review, security review
```

## 설치

이 저장소를 clone한 뒤 설치 스크립트를 실행합니다.

### Windows PowerShell

```powershell
git clone <your-repo-url>
cd hehehe
.\install.ps1
```

### macOS / Linux

```bash
git clone <your-repo-url>
cd hehehe
chmod +x install.sh uninstall.sh
./install.sh
```

기본 설치는 사용자 계정 전체에 적용됩니다. 설치 스크립트는 아래 경로로 플러그인을 복사합니다.

```text
~/.codex/plugins/hehehe
```

설치 후 Codex를 재시작해야 새 플러그인과 스킬이 인식됩니다.

## 프로젝트별 설치

특정 프로젝트에서만 쓰고 싶다면, 대상 프로젝트 폴더에서 `--project` 옵션으로 설치합니다.

### Windows PowerShell

```powershell
cd C:\path\to\your-project
C:\path\to\hehehe\install.ps1 -Project
```

### macOS / Linux

```bash
cd /path/to/your-project
/path/to/hehehe/install.sh --project
```

또는 hehehe 저장소 안에서 대상 프로젝트 경로를 지정해도 됩니다. 이 방식이 긴 명령을 줄일 때 편합니다.

Windows:

```powershell
.\install.ps1 -Target C:\path\to\your-project
```

macOS/Linux:

```bash
./install.sh --target /path/to/your-project
```

프로젝트별 설치는 아래 경로에 복사합니다.

```text
<your-project>/.codex/plugins/hehehe
```

이 방식은 해당 프로젝트 폴더에서 실행하는 Codex에만 hehehe를 적용하고 싶을 때 사용합니다.

## 삭제

### Windows PowerShell

```powershell
.\uninstall.ps1
```

### macOS / Linux

```bash
./uninstall.sh
```

삭제 스크립트는 아래 경로를 제거합니다.

```text
~/.codex/plugins/hehehe
```

프로젝트별 설치를 삭제하려면 대상 프로젝트 폴더에서 같은 옵션을 사용합니다.

Windows:

```powershell
cd C:\path\to\your-project
C:\path\to\hehehe\uninstall.ps1 -Project
```

macOS/Linux:

```bash
cd /path/to/your-project
/path/to/hehehe/uninstall.sh --project
```

hehehe 저장소 안에서 대상 프로젝트를 지정해 삭제할 수도 있습니다.

Windows:

```powershell
.\uninstall.ps1 -Target C:\path\to\your-project
```

macOS/Linux:

```bash
./uninstall.sh --target /path/to/your-project
```

삭제 후에도 Codex를 재시작해야 반영됩니다.

## 사용법

Codex에서 `$hehehe:<skill>` 형태로 호출합니다.

대표 명령:

```text
$hehehe:ideate
$hehehe:auto-resolve
$hehehe:preflight
$hehehe:review
```

예시:

```text
$hehehe:ideate 새 SaaS 대시보드 기능 아이디어를 구현 가능한 스펙으로 정리해줘
```

```text
$hehehe:auto-resolve .hehehe/implementation-spec.md 기준으로 기능을 끝까지 구현해줘
```

```text
$hehehe:preflight 지금 구현이 완료 기준을 만족하는지 출하 전 점검해줘
```

```text
$hehehe:review 현재 변경사항을 코드 리뷰해줘
```

## 주요 스킬

### 메인 파이프라인

- `hehehe:ideate`: 아이디어를 로드맵, 완료 기준, 구현 스펙으로 정리
- `hehehe:auto-resolve`: 구현, 검증, 리뷰, 수정, 정리까지 자동 진행
- `hehehe:preflight`: 출하 전 완료 기준 대비 구현 상태 점검

### 문제 해결과 리뷰

- `hehehe:resolve`: 단일 버그 수정
- `hehehe:team-resolve`: 복잡한 버그 해결
- `hehehe:evaluate`: 구현 결과 평가
- `hehehe:review`: 코드 리뷰
- `hehehe:team-review`: 다관점 리뷰
- `hehehe:browser-validate`: 브라우저 기반 UI 검증

### UI/UX

- `hehehe:design-ui`: UI 시안 생성
- `hehehe:team-design-ui`: 다관점 UI 시안 생성
- `hehehe:design-system`: 선택한 UI 방향에서 디자인 시스템 추출
- `hehehe:implement-ui`: 디자인 시스템 기반 UI 구현

### 제품 기획

- `hehehe:discover-product`: 제품 발견 인터뷰와 요구사항 정리
- `hehehe:product-spec`: 제품 단위 스펙 작성
- `hehehe:feature-spec`: 기능 단위 구현 스펙 작성
- `hehehe:recommend-features`: 다음 기능 추천

### 유지보수

- `hehehe:clean`: 코드 위생 정리
- `hehehe:update-docs`: 문서 동기화

## 작업 파일

복잡한 작업에서는 `.hehehe/` 폴더를 사용합니다.

```text
.hehehe/done-criteria.md
.hehehe/implementation-spec.md
.hehehe/checks.md
.hehehe/claude-review.md
.hehehe/final-report.md
```

이 파일들은 단계 간 상태 공유용입니다. 사용자 문서라기보다 Codex가 작업을 안정적으로 이어가기 위한 내부 기록입니다.

## 설계 원칙

- Codex가 메인입니다.
- Claude는 선택적 보조 리뷰어입니다.
- Claude 결과는 조언일 뿐이며 Codex가 코드와 테스트로 검증해야 합니다.
- 구현, 수정, 최종 판단은 Codex가 맡습니다.
- 작은 작업에는 Claude를 호출하지 않아도 됩니다.

## 저장소 구조

```text
hehehe/
├─ install.ps1
├─ uninstall.ps1
├─ install.sh
├─ uninstall.sh
└─ plugins/
   └─ hehehe/
      ├─ .codex-plugin/
      │  └─ plugin.json
      ├─ skills/
      └─ templates/
```

## 문제 해결

### 설치했는데 Codex에서 안 보일 때

1. Codex를 완전히 종료했다가 다시 실행합니다.
2. 아래 경로에 플러그인이 복사됐는지 확인합니다.

```text
~/.codex/plugins/hehehe
```

3. `plugins/hehehe/.codex-plugin/plugin.json` 파일이 있는지 확인합니다.

### macOS에서 실행 권한 오류가 날 때

```bash
chmod +x install.sh uninstall.sh
```

### Windows에서 스크립트 실행 정책 오류가 날 때

PowerShell을 열고 아래처럼 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

삭제는:

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```
