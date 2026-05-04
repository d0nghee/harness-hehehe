param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$PluginName = "hehehe"
$TargetPluginDir = Join-Path $HOME ".codex\plugins\$PluginName"

Write-Host "$(if ($DryRun) { '[dry-run] ' })Uninstalling hehehe Codex plugin"
Write-Host "Plugin target: $TargetPluginDir"

if (-not $DryRun -and (Test-Path -LiteralPath $TargetPluginDir)) {
    Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
}

Write-Host "Uninstalled hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
