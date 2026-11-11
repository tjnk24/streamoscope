function Get-Hashes {
    param([string]$Directory)

    $hashes = [ordered]@{}

    Get-ChildItem -LiteralPath $Directory -Recurse -File | Sort-Object FullName | ForEach-Object {
        $hashes[$_.FullName] = (Get-FileHash -LiteralPath $_.FullName).Hash
    }

    return ($hashes.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "`n"
}
