function Write-TextFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory)][bool]$HasBom
    )

    $encoding = [System.Text.UTF8Encoding]::new($HasBom, $true)
    $temporaryPath = "$Path.streamoscope.tmp"

    try {
        [System.IO.File]::WriteAllText($temporaryPath, $Text, $encoding)

        if ((Read-TextFile -Path $temporaryPath).Text -cne $Text) {
            throw "Verification failed for $Path"
        }

        if (-not (Test-Path -LiteralPath $Path)) {
            [System.IO.File]::Move($temporaryPath, $Path)

            return
        }

        try {
            [System.IO.File]::Replace($temporaryPath, $Path, [NullString]::Value)
        } catch [System.PlatformNotSupportedException], [System.IO.IOException] {
            [System.IO.File]::Copy($temporaryPath, $Path, $true)
        }
    } finally {
        if (Test-Path -LiteralPath $temporaryPath) {
            Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
        }
    }
}
