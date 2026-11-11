function ConvertTo-Canonical {
    param([string]$Path)

    return (Read-TextFile -Path $Path).Text | ConvertFrom-Json | ConvertTo-Json -Depth 100 -Compress
}
