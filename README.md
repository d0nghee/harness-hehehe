# hehehe 설치 매뉴얼

hehehe는 Codex를 주 실행자로 두고, Claude를 선택적 보조 리뷰어로 쓰는 Codex 플러그인입니다.

이 README는 GitHub 첫 화면에서 보이는 설치 전용 매뉴얼입니다. 사용법은 [USAGE.md](USAGE.md)를 확인하세요.

## 빠른 설치

### Windows PowerShell

```powershell
git clone https://github.com/d0nghee/harness-hehehe.git hehehe
cd hehehe
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

### macOS / Linux

```bash
git clone https://github.com/d0nghee/harness-hehehe.git hehehe
cd hehehe
chmod +x install.sh uninstall.sh
./install.sh
```

기본 설치 대상은 Codex 사용자 홈입니다.

```text
$CODEX_HOME/plugins/hehehe
```

`CODEX_HOME`이 없으면 다음 경로를 사용합니다.

```text
~/.codex/plugins/hehehe
```

설치 후 Codex를 재시작해야 플러그인과 스킬이 다시 스캔됩니다.

## 프로젝트에 설치

특정 프로젝트에서만 hehehe를 쓰려면 프로젝트 루트에 설치합니다.

### 현재 디렉터리에 설치

Windows:

```powershell
cd C:\path\to\your-project
C:\path\to\hehehe\install.ps1 -Project
```

macOS/Linux:

```bash
cd /path/to/your-project
/path/to/hehehe/install.sh --project
```

### 대상 경로를 지정해서 설치

Windows:

```powershell
C:\path\to\hehehe\install.ps1 -Target C:\path\to\your-project
```

macOS/Linux:

```bash
/path/to/hehehe/install.sh --target /path/to/your-project
```

프로젝트 설치 결과는 다음 구조가 됩니다.

```text
<your-project>/plugins/hehehe
<your-project>/.agents/plugins/marketplace.json
```

## 설치 확인

변경 없이 설치 대상만 확인하려면 dry run을 사용합니다.

Windows:

```powershell
.\install.ps1 -DryRun
.\install.ps1 -Project -DryRun
.\install.ps1 -Target C:\path\to\your-project -DryRun
```

macOS/Linux:

```bash
./install.sh --dry-run
./install.sh --project --dry-run
./install.sh --target /path/to/your-project --dry-run
```

출력에서 다음 값을 확인합니다.

```text
Source: 플러그인 원본 경로
Plugin target: 복사될 플러그인 경로
Marketplace target: 생성될 marketplace.json 경로
Scope: user 또는 project
```

## 제거

### 사용자 홈에서 제거

Windows:

```powershell
.\uninstall.ps1
```

macOS/Linux:

```bash
./uninstall.sh
```

### 프로젝트에서 제거

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

대상 경로를 직접 지정할 수도 있습니다.

Windows:

```powershell
.\uninstall.ps1 -Target C:\path\to\your-project
```

macOS/Linux:

```bash
./uninstall.sh --target /path/to/your-project
```

제거 후에도 Codex를 재시작해야 스킬 목록이 갱신됩니다.

## 저장소 구조

```text
hehehe/
  README.md
  USAGE.md
  install.ps1
  uninstall.ps1
  install.sh
  uninstall.sh
  .agents/
    plugins/
      marketplace.json
  plugins/
    hehehe/
      .codex-plugin/
        plugin.json
      skills/
      templates/
```

## 문제 해결

### PowerShell 실행 정책 오류

Windows에서 스크립트 실행 정책 오류가 나면 다음 방식으로 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

제거도 동일합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

### 설치했는데 Codex에 스킬이 보이지 않음

1. 설치 출력의 `Plugin target` 경로가 의도한 위치인지 확인합니다.
2. `plugins/hehehe/.codex-plugin/plugin.json` 파일이 설치 대상에 있는지 확인합니다.
3. `.agents/plugins/marketplace.json` 파일이 설치 대상에 있는지 확인합니다.
4. Codex를 완전히 재시작합니다.

### 프로젝트 설치와 사용자 홈 설치가 헷갈림

- 모든 프로젝트에서 쓰려면 기본 설치를 사용합니다.
- 특정 프로젝트에서만 쓰려면 `-Project` 또는 `--project`를 사용합니다.
- 다른 프로젝트 경로에 설치하려면 `-Target` 또는 `--target`을 사용합니다.

### 기존 설치를 새 버전으로 갱신

설치 스크립트는 기존 `plugins/hehehe` 폴더를 지우고 새 번들을 복사합니다.

```powershell
.\install.ps1
```

```bash
./install.sh
```

프로젝트 설치도 같은 방식으로 다시 실행하면 갱신됩니다.
