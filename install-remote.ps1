param(
    [switch]$DryRun,
    [switch]$Project,
    [string]$Target,
    [string]$Ref = "main"
)

$ErrorActionPreference = "Stop"

$Repo = "d0nghee/harness-hehehe"
$ZipUrl = "https://github.com/$Repo/archive/refs/heads/$Ref.zip"
$TempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("hehehe-install-" + [System.Guid]::NewGuid().ToString("N"))
$ZipPath = Join-Path $TempRoot "hehehe.zip"

try {
    New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null

    Write-Host "Downloading hehehe from $ZipUrl"
    Invoke-WebRequest -UseBasicParsing -Uri $ZipUrl -OutFile $ZipPath

    Expand-Archive -LiteralPath $ZipPath -DestinationPath $TempRoot -Force
    $RepoRoot = Get-ChildItem -LiteralPath $TempRoot -Directory |
        Where-Object { $_.Name -like "harness-hehehe-*" } |
        Select-Object -First 1

    if (-not $RepoRoot) {
        throw "Downloaded archive did not contain the expected harness-hehehe directory."
    }

    $Installer = Join-Path $RepoRoot.FullName "install.ps1"
    if (-not (Test-Path -LiteralPath $Installer)) {
        throw "Downloaded archive did not contain install.ps1."
    }

    $InstallArgs = @()
    if ($DryRun) {
        $InstallArgs += "-DryRun"
    }
    if ($Project) {
        $InstallArgs += "-Project"
    }
    if ($Target) {
        $InstallArgs += @("-Target", $Target)
    }

    & powershell -ExecutionPolicy Bypass -File $Installer @InstallArgs
} finally {
    if (Test-Path -LiteralPath $TempRoot) {
        Remove-Item -LiteralPath $TempRoot -Recurse -Force -Confirm:$false
    }
}
