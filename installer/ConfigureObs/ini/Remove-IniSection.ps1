function Remove-IniSection {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory)][string]$Section
    )

    $newline = if ($Text.Contains("`r`n")) { "`r`n" } else { "`n" }
    $lines = [string[]]($Text -split '\r?\n')
    $keptLines = [System.Collections.Generic.List[string]]::new()
    $isInSection = $false

    foreach ($line in $lines) {
        $trimmed = $line.Trim()

        if ($trimmed.StartsWith('[') -and $trimmed.EndsWith(']')) {
            $isInSection = $trimmed -eq "[$Section]"
        }

        if (-not $isInSection) {
            $keptLines.Add($line)
        }
    }

    if ($keptLines.Count -eq $lines.Count) {
        return $Text
    }

    return $keptLines -join $newline
}
