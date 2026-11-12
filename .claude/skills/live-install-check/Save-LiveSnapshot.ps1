param(
    [Parameter(Mandatory)][string]$SnapshotDirectory
)

$ErrorActionPreference = 'Stop'

$skillDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $skillDirectory '..\..\..')).Path
$obsConfig = Join-Path $env:APPDATA 'obs-studio'
$dataDirectory = Join-Path $env:LOCALAPPDATA 'streamoscope'
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\streamoscope'

Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'installer\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }
Get-ChildItem -LiteralPath $skillDirectory -Filter 'Get-*.ps1' | ForEach-Object { . $_.FullName }

if (Test-ObsRunning) {
    throw 'OBS is running: close it before taking a snapshot'
}

if (Test-Path -LiteralPath $SnapshotDirectory) {
    throw "$SnapshotDirectory exists: pick a new name"
}

$obsCopy = Join-Path $SnapshotDirectory 'obs-studio'
New-Item -ItemType Directory -Path $obsCopy -Force | Out-Null

foreach ($relativePath in Get-ObsFiles -Root $obsConfig) {
    $target = Join-Path $obsCopy $relativePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $obsConfig $relativePath) -Destination $target
}

if (Test-Path -LiteralPath $dataDirectory) {
    Copy-Item -LiteralPath $dataDirectory -Destination (Join-Path $SnapshotDirectory 'streamoscope-data') -Recurse
}

[ordered]@{
    data = Get-TreeHashes -Root $dataDirectory
    install = Get-TreeHashes -Root $installDirectory
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $SnapshotDirectory 'hashes.json') -Encoding UTF8

$dataItems = if (Test-Path -LiteralPath $dataDirectory) { (Get-ChildItem -LiteralPath $dataDirectory -Force -Name | Sort-Object) -join ', ' } else { 'none' }
Write-Output "snapshot: $((Get-ObsFiles -Root $obsCopy).Count) OBS files, data folder: $dataItems, install folder: $(Test-Path -LiteralPath $installDirectory)"
