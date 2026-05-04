param(
    [switch]$DryRun,
    [switch]$Project,
    [string]$Target
)

$ErrorActionPreference = "Stop"

$PluginName = "hehehe"
$RepoRoot = $PSScriptRoot
$SourcePluginDir = Join-Path $RepoRoot "plugins\$PluginName"
if ($Target) {
    $TargetRoot = (Resolve-Path -LiteralPath $Target).Path
    $TargetPluginDir = Join-Path $TargetRoot ".codex\plugins\$PluginName"
    $Scope = "project"
} elseif ($Project) {
    $TargetPluginDir = Join-Path (Get-Location).Path ".codex\plugins\$PluginName"
    $Scope = "project"
} else {
    $TargetPluginDir = Join-Path $HOME ".codex\plugins\$PluginName"
    $Scope = "user"
}

if (-not (Test-Path -LiteralPath $SourcePluginDir)) {
    throw "Missing bundled plugin directory: $SourcePluginDir"
}

Write-Host "$(if ($DryRun) { '[dry-run] ' })Installing hehehe Codex plugin"
Write-Host "Source: $SourcePluginDir"
Write-Host "Plugin target: $TargetPluginDir"
Write-Host "Scope: $Scope"

if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetPluginDir) | Out-Null
    if (Test-Path -LiteralPath $TargetPluginDir) {
        Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
    }
    Copy-Item -LiteralPath $SourcePluginDir -Destination $TargetPluginDir -Recurse -Force
}

Write-Host "Installed hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
