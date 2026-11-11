function New-TestKey {
    param([string]$Name)

    $directory = Join-Path $TestDrive "keys-$Name"
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    & $script:minisign -G -W -p (Join-Path $directory 'key.pub') -s (Join-Path $directory 'key.sec') | Out-Null

    return [pscustomobject]@{
        Secret = Join-Path $directory 'key.sec'
        Public = (Get-Content -LiteralPath (Join-Path $directory 'key.pub'))[1]
    }
}
