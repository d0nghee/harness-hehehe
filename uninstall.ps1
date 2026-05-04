param(
    [switch]$DryRun,
    [switch]$Project,
    [string]$Target
)

$ErrorActionPreference = "Stop"

$PluginName = "hehehe"
if ($Target) {
    $TargetRoot = (Resolve-Path -LiteralPath $Target).Path
    $Scope = "project"
} elseif ($Project) {
    $TargetRoot = (Get-Location).Path
    $Scope = "project"
} else {
    $TargetRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
    $Scope = "user"
}

$TargetPluginDir = Join-Path $TargetRoot "plugins\$PluginName"
$MarketplacePath = Join-Path $TargetRoot ".agents\plugins\marketplace.json"

Write-Host "$(if ($DryRun) { '[dry-run] ' })Uninstalling hehehe Codex plugin"
Write-Host "Plugin target: $TargetPluginDir"
Write-Host "Marketplace target: $MarketplacePath"
Write-Host "Scope: $Scope"

if (-not $DryRun -and (Test-Path -LiteralPath $TargetPluginDir)) {
    Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
}

if (-not $DryRun -and (Test-Path -LiteralPath $MarketplacePath)) {
    Remove-Item -LiteralPath $MarketplacePath -Force
}

Write-Host "Uninstalled hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
