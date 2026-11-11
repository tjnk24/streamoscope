function Get-BridgePaths {
    param([string]$Path)

    $root = Read-JsonDocument -Text (Read-TextFile -Path $Path).Text

    return @((Get-JsonMember -Node (Get-JsonMember -Node $root -Key 'modules') -Key 'scripts-tool').Items | ForEach-Object { (Get-JsonMember -Node $_ -Key 'path').Value })
}
