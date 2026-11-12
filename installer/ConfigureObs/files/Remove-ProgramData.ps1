function Remove-ProgramData {
    param(
        [Parameter(Mandatory)][string]$DataDirectory
    )

    $keptItems = @()

    foreach ($itemName in $script:RemovedDataItems) {
        $itemPath = Join-Path $DataDirectory $itemName

        if (-not (Test-Path -LiteralPath $itemPath)) {
            continue
        }

        try {
            Remove-Item -LiteralPath $itemPath -Recurse -Force -ErrorAction Stop
        } catch {
            $keptItems += $itemName
        }
    }

    return $keptItems
}
