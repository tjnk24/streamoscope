function Get-ObsFiles {
    param(
        [Parameter(Mandatory)][string]$Root
    )

    $files = @(@('global.ini', 'user.ini') | Where-Object { Test-Path -LiteralPath (Join-Path $Root $_) })
    $basicDirectory = Join-Path $Root 'basic'

    if (Test-Path -LiteralPath $basicDirectory) {
        $files += Get-ChildItem -LiteralPath $basicDirectory -Recurse -File -Force | ForEach-Object { $_.FullName.Substring($Root.Length).TrimStart('\') }
    }

    return @($files | Sort-Object)
}
