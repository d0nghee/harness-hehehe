param(
    [switch]$DryRun,
    [switch]$Project,
    [string]$Target
)

$ErrorActionPreference = "Stop"

$PluginName = "hehehe"
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

Write-Host "$(if ($DryRun) { '[dry-run] ' })Uninstalling hehehe Codex plugin"
Write-Host "Plugin target: $TargetPluginDir"
Write-Host "Scope: $Scope"

if (-not $DryRun -and (Test-Path -LiteralPath $TargetPluginDir)) {
    Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
}

Write-Host "Uninstalled hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
