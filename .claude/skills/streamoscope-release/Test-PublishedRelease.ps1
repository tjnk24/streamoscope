param(
    [Parameter(Mandatory)][ValidatePattern('^\d+\.\d+\.\d+$')][string]$Version,
    [Parameter(Mandatory)][string]$DownloadDirectory
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$skillDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $skillDirectory '..\..\..')).Path
$repositoryName = 'tjnk24/streamoscope'
$tag = "v$Version"
$publicKey = Join-Path $repositoryRoot 'minisign.pub'
$notesPath = Join-Path $repositoryRoot "docs\release-notes\$Version.md"
$signedFiles = @("streamoscope-setup-$Version.exe", "streamoscope-$Version.zip", 'compatibility.json')
$expectedAssets = @($signedFiles) + @($signedFiles | ForEach-Object { "$_.minisig" }) + @('SHA256SUMS.txt')
$failures = 0

. (Join-Path $repositoryRoot 'installer\updater\UpdateWidget\consts.ps1')
. (Join-Path $skillDirectory 'Write-CheckResult.ps1')

$minisignCandidates = @(
    (Get-Command 'minisign' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source),
    (Join-Path $repositoryRoot 'node_modules\.cache\minisign\0.12\minisign-win64\x86_64\minisign.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\streamoscope\updater\minisign.exe')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
$minisign = $minisignCandidates | Select-Object -First 1

if (-not $minisign) {
    throw 'minisign.exe not found: install it (winget install jedisct1.minisign) or run npm run package:installer once'
}

if ((Test-Path -LiteralPath $DownloadDirectory) -and @(Get-ChildItem -LiteralPath $DownloadDirectory -Force).Count -gt 0) {
    throw "$DownloadDirectory is not empty"
}

New-Item -ItemType Directory -Path $DownloadDirectory -Force | Out-Null

$ErrorActionPreference = 'Continue'
$releaseJson = & gh release view $tag --repo $repositoryName --json 'tagName,isDraft,isPrerelease,body,assets,publishedAt' 2>$null
$viewExitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'

if ($viewExitCode -ne 0) {
    throw "gh release view $tag failed with exit code $viewExitCode"
}

$release = ($releaseJson -join "`n") | ConvertFrom-Json
Write-Output "release $($release.tagName), published $($release.publishedAt)"
Write-CheckResult -IsOk (-not $release.isDraft) -Text 'the release is published, not a draft'
Write-CheckResult -IsOk (-not $release.isPrerelease) -Text 'the release is not a prerelease'

$latestTag = (& gh release view --repo $repositoryName --json tagName 2>$null | ConvertFrom-Json).tagName
Write-CheckResult -IsOk ($latestTag -eq $tag) -Text "GitHub marks $tag as the latest release (latest: $latestTag)"

$assetNames = @($release.assets | ForEach-Object { $_.name })

foreach ($assetName in $expectedAssets) {
    Write-CheckResult -IsOk ($assetNames -contains $assetName) -Text "asset $assetName"
}

$extraAssets = @($assetNames | Where-Object { $expectedAssets -notcontains $_ })
Write-CheckResult -IsOk ($extraAssets.Count -eq 0) -Text "no unexpected assets$(if ($extraAssets.Count) { ': ' + ($extraAssets -join ', ') })"

$body = [string]$release.body
$compatibilityMatch = [regex]::Match($body, '<!-- compatibility: (\{.*\}) -->\s*$')
Write-CheckResult -IsOk $compatibilityMatch.Success -Text 'the notes end with the compatibility comment'

if (Test-Path -LiteralPath $notesPath) {
    $notesText = ([System.IO.File]::ReadAllText($notesPath, [System.Text.UTF8Encoding]::new($false))).Trim() -replace '\r\n', "`n"
    Write-CheckResult -IsOk (($body -replace '\r\n', "`n").StartsWith($notesText)) -Text "the published notes start with docs/release-notes/$Version.md"
} else {
    Write-CheckResult -IsOk $false -Text "docs/release-notes/$Version.md exists"
}

$ErrorActionPreference = 'Continue'
& gh release download $tag --repo $repositoryName --dir $DownloadDirectory 2>$null
$downloadExitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
Write-CheckResult -IsOk ($downloadExitCode -eq 0) -Text "assets downloaded to $DownloadDirectory"

foreach ($fileName in $signedFiles) {
    $filePath = Join-Path $DownloadDirectory $fileName

    if (-not (Test-Path -LiteralPath $filePath)) {
        Write-CheckResult -IsOk $false -Text "signature of $fileName (file missing)"
        continue
    }

    $ErrorActionPreference = 'Continue'
    & $minisign -V -q -p $publicKey -m $filePath 2>$null | Out-Null
    $verifyExitCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    Write-CheckResult -IsOk ($verifyExitCode -eq 0) -Text "minisign signature of $fileName matches minisign.pub"
}

$checksumsPath = Join-Path $DownloadDirectory 'SHA256SUMS.txt'

if (Test-Path -LiteralPath $checksumsPath) {
    $checksumsText = Get-Content -LiteralPath $checksumsPath -Raw

    foreach ($fileName in $signedFiles | Where-Object { $_ -ne 'compatibility.json' }) {
        $checksumMatch = [regex]::Match($checksumsText, "(?m)^([0-9a-fA-F]{64})\s+\*?$([regex]::Escape($fileName))\s*$")
        $filePath = Join-Path $DownloadDirectory $fileName
        $isSame = $checksumMatch.Success -and (Test-Path -LiteralPath $filePath) -and ($checksumMatch.Groups[1].Value -eq (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash)
        Write-CheckResult -IsOk ([bool]$isSame) -Text "SHA256SUMS.txt matches $fileName"
    }
}

$compatibilityPath = Join-Path $DownloadDirectory 'compatibility.json'

if ($compatibilityMatch.Success -and (Test-Path -LiteralPath $compatibilityPath)) {
    $fromFile = Get-Content -LiteralPath $compatibilityPath -Raw -Encoding UTF8 | ConvertFrom-Json | ConvertTo-Json -Depth 10 -Compress
    $fromNotes = $compatibilityMatch.Groups[1].Value | ConvertFrom-Json | ConvertTo-Json -Depth 10 -Compress
    Write-CheckResult -IsOk ($fromFile -eq $fromNotes) -Text 'the compatibility comment equals compatibility.json'
    Write-CheckResult -IsOk ((ConvertFrom-Json $fromFile).version -eq $Version) -Text 'compatibility.json names this version'
}

$archivePath = Join-Path $DownloadDirectory "streamoscope-$Version.zip"

if (Test-Path -LiteralPath $archivePath) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)

    try {
        $entryNames = @($archive.Entries | ForEach-Object { $_.FullName -replace '\\', '/' })
    } finally {
        $archive.Dispose()
    }

    $topFolder = "streamoscope-$Version/"
    $outsideTop = @($entryNames | Where-Object { -not $_.StartsWith($topFolder) })
    Write-CheckResult -IsOk ($outsideTop.Count -eq 0) -Text "every archive entry is under $topFolder"

    foreach ($requiredFile in $script:RequiredPackageFiles) {
        $entryName = $topFolder + ($requiredFile -replace '\\', '/')
        Write-CheckResult -IsOk ($entryNames -contains $entryName) -Text "archive holds $requiredFile"
    }
}

Write-Output "failures: $failures"
