param(
    [string]$PackageRoot = $env:CODEX_PACKAGE_ROOT,
    [string]$ArchiveRoot = $env:CODEX_ARCHIVE_ROOT,
    [string]$Version = $env:CODEX_PACKAGE_VERSION
)

$ErrorActionPreference = 'Stop'

function Resolve-NpmGlobalPackageRoot {
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmCmd) {
        $root = (& npm root -g).Trim()
        if ($root) {
            return (Join-Path $root '@openai\codex')
        }
    }

    $candidate = Join-Path $HOME 'AppData\Local\nvm\v23.10.0\node_modules\@openai\codex'
    if (Test-Path $candidate) {
        return (Resolve-Path $candidate).Path
    }

    throw 'Unable to resolve the Codex package root. Set CODEX_PACKAGE_ROOT.'
}

if (-not $PackageRoot) {
    $PackageRoot = Resolve-NpmGlobalPackageRoot
}

if (-not (Test-Path -LiteralPath $PackageRoot)) {
    throw "Package root not found: $PackageRoot"
}

if (-not $ArchiveRoot) {
    $ArchiveRoot = Join-Path $HOME 'CodexArchives'
}

$packageJsonPath = Join-Path $PackageRoot 'package.json'
if (-not $Version -and (Test-Path -LiteralPath $packageJsonPath)) {
    $packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
    $Version = $packageJson.version
}

if (-not $Version) {
    $Version = 'unknown'
}

$safeVersion = ($Version -replace '[^0-9A-Za-z._-]', '_')
$stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'

New-Item -ItemType Directory -Path $ArchiveRoot -Force | Out-Null
$archivePath = Join-Path $ArchiveRoot "codex-$safeVersion-$stamp.zip"

if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

Compress-Archive -LiteralPath $PackageRoot -DestinationPath $archivePath -CompressionLevel Optimal

[pscustomobject]@{
    PackageRoot  = $PackageRoot
    ArchiveRoot   = $ArchiveRoot
    Version       = $Version
    ArchivePath   = $archivePath
}
