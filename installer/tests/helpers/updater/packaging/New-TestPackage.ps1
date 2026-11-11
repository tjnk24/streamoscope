function New-TestPackage {
    param(
        [string]$Version,
        [string]$Destination,
        [switch]$WithoutBridge
    )

    $source = Join-Path $TestDrive ([guid]::NewGuid().ToString('N'))
    $package = Join-Path $source "streamoscope-$Version"
    $randomBytes = New-Object byte[] 300000

    (New-Object System.Random).NextBytes($randomBytes)

    New-Item -ItemType Directory -Path (Join-Path $package 'dock'), (Join-Path $package 'updater'), (Join-Path $package 'streamoscope-bridge') -Force | Out-Null
    [System.IO.File]::WriteAllBytes((Join-Path $package 'dock\index.html'), $randomBytes)
    Set-Content -LiteralPath (Join-Path $package 'updater\Update-Widget.ps1') -Value 'exit 0'
    Set-Content -LiteralPath (Join-Path $package 'compatibility.json') -Value ("{`"version`": `"$Version`"}")

    if (-not $WithoutBridge) {
        Set-Content -LiteralPath (Join-Path $package 'streamoscope-bridge\main.lua') -Value 'return {}'
    }

    [System.IO.Compression.ZipFile]::CreateFromDirectory($package, $Destination, [System.IO.Compression.CompressionLevel]::Optimal, $true)
}
