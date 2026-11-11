function Remove-BrowserDock {
    param(
        [AllowNull()][AllowEmptyString()][string]$DocksJson,
        [AllowNull()][AllowEmptyString()][string]$Uuid,
        [AllowNull()][AllowEmptyString()][string]$Url
    )

    if ([string]::IsNullOrWhiteSpace($DocksJson)) {
        return [pscustomobject]@{Json = $DocksJson; Changed = $false}
    }

    $docks = Read-JsonDocument -Text $DocksJson

    if ($docks.Kind -ne 'array') {
        throw 'ExtraBrowserDocks is not a JSON array'
    }

    $kept = @($docks.Items | Where-Object {
        $dockUuid = (Get-JsonMember -Node $_ -Key 'uuid').Value
        $dockUrl = (Get-JsonMember -Node $_ -Key 'url').Value
        $isOurs = (-not [string]::IsNullOrEmpty($Uuid) -and $dockUuid -eq $Uuid) -or (-not [string]::IsNullOrEmpty($Url) -and $dockUrl -eq $Url)

        -not $isOurs
    })

    if ($kept.Count -eq $docks.Items.Count) {
        return [pscustomobject]@{Json = $DocksJson; Changed = $false}
    }

    return [pscustomobject]@{
        Json = Remove-JsonArrayItem -Text $DocksJson -Array $docks -Kept $kept
        Changed = $true
    }
}
