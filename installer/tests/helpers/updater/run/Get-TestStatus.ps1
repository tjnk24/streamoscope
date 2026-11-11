function Get-TestStatus {
    param($Release)

    return Get-Content -LiteralPath $Release.Status -Raw | ConvertFrom-Json
}
