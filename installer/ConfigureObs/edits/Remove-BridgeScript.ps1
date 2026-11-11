function Remove-BridgeScript {
    param(
        [Parameter(Mandatory)][string]$CollectionText,
        [Parameter(Mandatory)][string]$ScriptPath
    )

    $root = Read-JsonDocument -Text $CollectionText
    $scripts = Get-JsonMember -Node (Get-JsonMember -Node $root -Key 'modules') -Key 'scripts-tool'

    if ($null -eq $scripts -or $scripts.Kind -ne 'array') {
        return [pscustomobject]@{Text = $CollectionText; Changed = $false}
    }

    $kept = @($scripts.Items | Where-Object {
        -not (Test-SamePath -First (Get-JsonMember -Node $_ -Key 'path').Value -Second $ScriptPath)
    })

    if ($kept.Count -eq $scripts.Items.Count) {
        return [pscustomobject]@{Text = $CollectionText; Changed = $false}
    }

    return [pscustomobject]@{
        Text = Remove-JsonArrayItem -Text $CollectionText -Array $scripts -Kept $kept
        Changed = $true
    }
}
