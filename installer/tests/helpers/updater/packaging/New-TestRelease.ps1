function New-TestRelease {
    param(
        [string]$Version = '0.2.0',
        [string]$CompatibilityVersion = $Version,
        [string]$MinObsVersion = '28.0.0',
        [string]$InstalledVersion = '0.1.0',
        [DateTimeOffset]$PublishedAt = [DateTimeOffset]::UtcNow.AddDays(-7),
        $Key = $script:releaseKey,
        [switch]$TamperPackage,
        [switch]$SkipPackage,
        [switch]$WithoutBridge
    )

    $root = Join-Path $TestDrive ([guid]::NewGuid().ToString('N'))
    $release = Join-Path $root "release\v$Version"
    $install = Join-Path $root 'install'

    New-Item -ItemType Directory -Path $release, (Join-Path $install "versions\$InstalledVersion") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $install 'current-version.js') -Value "window.STREAMOSCOPE_VERSION = '$InstalledVersion';"

    $compatibility = Join-Path $release 'compatibility.json'
    Set-Content -LiteralPath $compatibility -Value ("{`"version`": `"$CompatibilityVersion`", `"minObsVersion`": `"$MinObsVersion`"}")
    Add-TestSignature -Path $compatibility -Key $Key

    if (-not $SkipPackage) {
        $package = Join-Path $release "streamoscope-$Version.zip"
        New-TestPackage -Version $Version -Destination $package -WithoutBridge:$WithoutBridge
        Add-TestSignature -Path $package -Key $Key

        if ($TamperPackage) {
            [System.IO.File]::AppendAllText($package, 'tampered')
        }
    }

    $latest = Join-Path $root 'latest.json'
    Set-Content -LiteralPath $latest -Value ("{`"tag_name`": `"v$Version`", `"published_at`": `"$($PublishedAt.ToString('yyyy-MM-ddTHH:mm:ssZ'))`"}")

    return [pscustomobject]@{
        BaseUrl = [System.Uri]::new((Join-Path $root 'release')).AbsoluteUri
        LatestUrl = [System.Uri]::new($latest).AbsoluteUri
        Install = $install
        Status = Join-Path $root 'data\update-status.json'
    }
}
