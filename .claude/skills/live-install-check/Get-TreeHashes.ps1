function Get-TreeHashes {
    param(
        [Parameter(Mandatory)][string]$Root
    )

    $hashes = [ordered]@{}

    if (-not (Test-Path -LiteralPath $Root)) {
        return $hashes
    }

    Get-ChildItem -LiteralPath $Root -Recurse -File -Force | Sort-Object FullName | ForEach-Object {
        $hashes[$_.FullName.Substring($Root.Length).TrimStart('\')] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
    }

    return $hashes
}
