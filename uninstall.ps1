param(
    [switch]$DryRun,
    [switch]$Project
)

$ErrorActionPreference = "Stop"

$PluginName = "hehehe"
if ($Project) {
    $TargetPluginDir = Join-Path (Get-Location).Path ".codex\plugins\$PluginName"
} else {
    $TargetPluginDir = Join-Path $HOME ".codex\plugins\$PluginName"
}

Write-Host "$(if ($DryRun) { '[dry-run] ' })Uninstalling hehehe Codex plugin"
Write-Host "Plugin target: $TargetPluginDir"
Write-Host "Scope: $(if ($Project) { 'project' } else { 'user' })"

if (-not $DryRun -and (Test-Path -LiteralPath $TargetPluginDir)) {
    Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
}

Write-Host "Uninstalled hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
