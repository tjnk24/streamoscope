function Write-CheckResult {
    param(
        [Parameter(Mandatory)][bool]$IsOk,
        [Parameter(Mandatory)][string]$Text
    )

    $mark = if ($IsOk) { 'ok  ' } else { 'FAIL' }
    Write-Output "$mark $Text"

    if (-not $IsOk) {
        $script:failures++
    }
}
