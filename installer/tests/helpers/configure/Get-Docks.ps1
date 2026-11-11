function Get-Docks {
    param([string]$Path)

    $docks = ConvertFrom-Json -InputObject (Get-IniValue -Text (Read-TextFile -Path $Path).Text -Section 'BasicWindow' -Key 'ExtraBrowserDocks')

    foreach ($dock in $docks) {
        $dock
    }
}
