param(
    [string]$ExpectedVersion
)

$ErrorActionPreference = 'Stop'

$skillDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $skillDirectory '..\..\..')).Path
$obsConfig = Join-Path $env:APPDATA 'obs-studio'
$dataDirectory = Join-Path $env:LOCALAPPDATA 'streamoscope'
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\streamoscope'
$failures = 0

Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'installer\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }
. (Join-Path $repositoryRoot 'installer\updater\UpdateWidget\consts.ps1')
. (Join-Path $skillDirectory 'Write-CheckResult.ps1')

$appsEntry = Get-ItemProperty -LiteralPath $script:UninstallRegistryKey -ErrorAction SilentlyContinue
Write-CheckResult -IsOk ($null -ne $appsEntry) -Text "Apps entry: $(if ($appsEntry) { "$($appsEntry.DisplayName) $($appsEntry.DisplayVersion)" } else { 'missing' })"

if (-not (Test-Path -LiteralPath $installDirectory)) {
    Write-CheckResult -IsOk $false -Text 'the install folder exists'
    Write-Output "failures: $failures"
    return
}

$currentVersion = [regex]::Match((Get-Content -LiteralPath (Join-Path $installDirectory $script:CurrentVersionFileName) -Raw), $script:CurrentVersionFilePattern).Value
Write-Output "current version: $currentVersion; versions on disk: $((Get-ChildItem -LiteralPath (Join-Path $installDirectory $script:VersionsDirectoryName) -Directory -Name) -join ', ')"

if ($ExpectedVersion) {
    Write-CheckResult -IsOk ($currentVersion -eq $ExpectedVersion) -Text "current-version.js names $ExpectedVersion"
    Write-CheckResult -IsOk ($appsEntry -and $appsEntry.DisplayVersion -eq $ExpectedVersion) -Text "the Apps entry names $ExpectedVersion"
}

$versionDirectory = Join-Path $installDirectory "$($script:VersionsDirectoryName)\$currentVersion"
$stubTarget = Join-Path $installDirectory 'streamoscope-bridge.lua'
$stubSource = Join-Path $repositoryRoot 'installer\loader\streamoscope-bridge.lua'
Write-CheckResult -IsOk ((Test-Path -LiteralPath $stubTarget) -and (Get-FileHash -LiteralPath $stubSource).Hash -eq (Get-FileHash -LiteralPath $stubTarget).Hash) -Text 'the root streamoscope-bridge.lua is the stub from installer/loader'

foreach ($relativePath in @('dock\index.html', 'unins000.exe', 'updater\minisign.exe', 'configure-obs.ps1', 'ConfigureObs\Invoke-ConfigureObs.ps1')) {
    Write-CheckResult -IsOk (Test-Path -LiteralPath (Join-Path $installDirectory $relativePath)) -Text "install folder has $relativePath"
}

foreach ($relativePath in @('streamoscope-bridge.lua', 'dock\index.html', 'configure-obs.ps1', 'ConfigureObs\files\Remove-ProgramData.ps1') + $script:RequiredPackageFiles | Select-Object -Unique) {
    Write-CheckResult -IsOk (Test-Path -LiteralPath (Join-Path $versionDirectory $relativePath)) -Text "versions\$currentVersion has $relativePath"
}

$manifestPath = Join-Path $installDirectory 'install-manifest.json'

if (Test-Path -LiteralPath $manifestPath) {
    $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $docksIni = $manifest.docksIni
    $dockUrl = $manifest.dockUrl
    $bridgePath = $manifest.bridgePath
    $collections = @($manifest.collections)
} else {
    Write-Output 'no install-manifest.json: guessing the OBS files'
    $docksIni = if (Test-Path -LiteralPath (Join-Path $obsConfig 'user.ini')) { Join-Path $obsConfig 'user.ini' } else { Join-Path $obsConfig 'global.ini' }
    $dockUrl = ConvertTo-FileUrl -Path (Join-Path $installDirectory 'dock\index.html')
    $bridgePath = $stubTarget.Replace('\', '/')
    $collections = @(Get-ChildItem -LiteralPath (Join-Path $obsConfig 'basic\scenes') -Filter '*.json' | ForEach-Object { $_.FullName })
}

$docksJson = Get-IniValue -Text (Read-TextFile -Path $docksIni).Text -Section 'BasicWindow' -Key 'ExtraBrowserDocks'
$ourDocks = @(if ($docksJson) { ConvertFrom-Json -InputObject $docksJson | Where-Object { $_.url -eq $dockUrl } })
Write-CheckResult -IsOk ($ourDocks.Count -eq 1) -Text "exactly one StreamoScope dock in $(Split-Path -Leaf $docksIni) (found $($ourDocks.Count))"

foreach ($collection in $collections) {
    $hasBridge = (Test-Path -LiteralPath $collection) -and (Get-Content -LiteralPath $collection -Raw -Encoding UTF8).Contains($bridgePath)
    Write-CheckResult -IsOk $hasBridge -Text "the bridge is in scene collection $(Split-Path -Leaf $collection)"
}

$allCollections = @(Get-ChildItem -LiteralPath (Join-Path $obsConfig 'basic\scenes') -Filter '*.json').Count
Write-Output "scene collections: $($collections.Count) in the manifest, $allCollections json files in basic\scenes"

Write-Output "data folder: $((Get-ChildItem -LiteralPath $dataDirectory -Force -Name | Sort-Object) -join ', ')"
$configureLog = Join-Path $dataDirectory 'configure-obs.log'

if (Test-Path -LiteralPath $configureLog) {
    Write-Output '--- configure-obs.log, last 12 lines'
    Get-Content -LiteralPath $configureLog -Tail 12 -Encoding UTF8
}

$journal = Join-Path $dataDirectory 'logs\streamoscope.log'

if (Test-Path -LiteralPath $journal) {
    Write-Output '--- journal, last lines about loading and updates'
    Get-Content -LiteralPath $journal -Tail 400 -Encoding UTF8 | Where-Object { $_ -match 'loaded|started|installer|update|rollback' } | Select-Object -Last 8
}

Write-Output "failures: $failures"
