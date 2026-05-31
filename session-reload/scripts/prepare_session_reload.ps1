param(
    [string]$SessionId,
    [string]$TargetCwd,
    [switch]$Launch,
    [string]$CodexHome = "$env:USERPROFILE\.codex"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-LatestSessionId {
    param(
        [Parameter(Mandatory = $true)]
        [string]$HistoryPath
    )

    if (-not (Test-Path -LiteralPath $HistoryPath)) {
        throw "history file not found: $HistoryPath"
    }

    $line = Get-Content -LiteralPath $HistoryPath | Select-Object -Last 1
    if (-not $line) {
        throw "history file is empty: $HistoryPath"
    }

    $entry = $line | ConvertFrom-Json
    if (-not $entry.session_id) {
        throw "latest history entry does not contain session_id"
    }

    return [string]$entry.session_id
}

function Get-HooksStatus {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseDir
    )

    $configPath = Join-Path $BaseDir 'config.toml'
    $hooksPath = Join-Path $BaseDir 'hooks.json'
    $featureKey = 'hooks'
    $featureEnabled = $false

    if (Test-Path -LiteralPath $configPath) {
        $configText = Get-Content -LiteralPath $configPath -Raw
        if ($configText -match '(?m)^hooks\s*=\s*true\s*$') {
            $featureEnabled = $true
        }
    }

    return [ordered]@{
        feature_key = $featureKey
        feature_enabled = $featureEnabled
        config_path = $configPath
        hooks_path = $hooksPath
        hooks_file_exists = (Test-Path -LiteralPath $hooksPath)
    }
}

$historyPath = Join-Path $CodexHome 'history.jsonl'
$recordDir = Join-Path $CodexHome 'memories\skills\session-reload'
$recordPath = Join-Path $recordDir 'last_reload.json'

if (-not $SessionId) {
    $SessionId = Get-LatestSessionId -HistoryPath $historyPath
}

if (-not $TargetCwd) {
    $TargetCwd = (Get-Location).Path
}

$resumeCommand = "codex resume $SessionId"
$launchCommand = "Set-Location -LiteralPath '$TargetCwd'; $resumeCommand"
$launched = $false
$hooksStatus = Get-HooksStatus -BaseDir $CodexHome

if (-not (Test-Path -LiteralPath $recordDir)) {
    New-Item -ItemType Directory -Force -Path $recordDir | Out-Null
}

$record = [ordered]@{
    created_at = (Get-Date).ToString('o')
    session_id = $SessionId
    predicted_cwd = $TargetCwd
    resume_command = $resumeCommand
    launch_command = $launchCommand
    record_path = $recordPath
    launched_new_shell = $false
    can_terminate_current_host = $false
    hooks = $hooksStatus
}

if ($Launch) {
    Start-Process -FilePath 'powershell.exe' -ArgumentList @(
        '-NoExit',
        '-NoLogo',
        '-Command',
        $launchCommand
    ) | Out-Null
    $record.launched_new_shell = $true
    $launched = $true
}

$record | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $recordPath -Encoding utf8
$record | ConvertTo-Json -Depth 5

