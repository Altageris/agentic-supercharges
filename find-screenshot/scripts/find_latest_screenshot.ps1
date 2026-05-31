param(
    [string]$Folder = (Join-Path (Join-Path $env:USERPROFILE 'OneDrive\Images') ('Captures d' + [char]0x2019 + [char]0xE9 + 'cran'))
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Folder)) {
    throw "Screenshot folder not found: $Folder"
}

$latest = Get-ChildItem -LiteralPath $Folder -File |
    Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg', '.webp', '.bmp' } |
    Sort-Object LastWriteTime, Name -Descending |
    Select-Object -First 1

if (-not $latest) {
    throw "No image files were found in: $Folder"
}

Write-Output $latest.FullName
