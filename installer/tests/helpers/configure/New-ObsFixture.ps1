function New-ObsFixture {
    param([string]$Name)

    $root = Join-Path $TestDrive ([guid]::NewGuid().ToString('N'))
    $config = Join-Path $root 'obs-studio'

    New-Item -ItemType Directory -Path $root -Force | Out-Null

    if ($Name) {
        Copy-Item -LiteralPath (Join-Path $script:fixtures $Name) -Destination $config -Recurse
    } else {
        New-Item -ItemType Directory -Path $config | Out-Null
    }

    $globalIni = Join-Path $config 'global.ini'

    if (Test-Path -LiteralPath $globalIni) {
        $file = Read-TextFile -Path $globalIni
        Write-TextFile -Path $globalIni -Text $file.Text.Replace('__ROOT__', $root.Replace('\', '\\')) -HasBom $file.HasBom
    }

    $install = Join-Path $root "$script:cyrillicFolder and spaces\streamoscope"
    New-Item -ItemType Directory -Path $install -Force | Out-Null

    return [pscustomobject]@{
        Root = $root
        Config = $config
        Install = $install
        Data = Join-Path $root 'data'
        DockUrl = ConvertTo-FileUrl -Path (Join-Path $install 'dock\index.html')
        BridgePath = (Join-Path $install 'streamoscope-bridge.lua').Replace('\', '/')
    }
}
