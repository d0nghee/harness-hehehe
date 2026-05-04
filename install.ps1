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

if (-not (Test-Path -LiteralPath $SourcePluginDir)) {
    throw "Missing bundled plugin directory: $SourcePluginDir"
}

$ResolvedSourcePluginDir = (Resolve-Path -LiteralPath $SourcePluginDir).Path
if ((Test-Path -LiteralPath $TargetPluginDir) -and ((Resolve-Path -LiteralPath $TargetPluginDir).Path -eq $ResolvedSourcePluginDir)) {
    throw "Source and target plugin directories are the same. Run -Project from the target project, or use -Target C:\path\to\project."
}

Write-Host "$(if ($DryRun) { '[dry-run] ' })Installing hehehe Codex plugin"
Write-Host "Source: $SourcePluginDir"
Write-Host "Plugin target: $TargetPluginDir"
Write-Host "Marketplace target: $MarketplacePath"
Write-Host "Scope: $Scope"

if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetPluginDir) | Out-Null
    if (Test-Path -LiteralPath $TargetPluginDir) {
        Remove-Item -LiteralPath $TargetPluginDir -Recurse -Force
    }
    Copy-Item -LiteralPath $SourcePluginDir -Destination $TargetPluginDir -Recurse -Force

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $MarketplacePath) | Out-Null
    $Marketplace = [ordered]@{
        name = "$(Split-Path -Leaf $TargetRoot)-local"
        interface = [ordered]@{
            displayName = "$(Split-Path -Leaf $TargetRoot) Local Plugins"
        }
        plugins = @(
            [ordered]@{
                name = $PluginName
                source = [ordered]@{
                    source = "local"
                    path = "./plugins/$PluginName"
                }
                policy = [ordered]@{
                    installation = "AVAILABLE"
                    authentication = "ON_INSTALL"
                }
                category = "Productivity"
            }
        )
    }
    $MarketplaceJson = $Marketplace | ConvertTo-Json -Depth 10
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($MarketplacePath, $MarketplaceJson, $Utf8NoBom)
}

Write-Host "Installed hehehe."
Write-Host "Restart Codex so it can rescan plugins and skills."
