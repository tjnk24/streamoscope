function Get-JsonMember {
    param(
        [AllowNull()]$Node,
        [Parameter(Mandatory)][string]$Key
    )

    if ($null -eq $Node -or $Node.Kind -ne 'object') {
        return $null
    }

    $object = Expand-JsonValue -Node $Node

    foreach ($member in $object.Members) {
        if ($member.Key -ceq $Key) {
            return Expand-JsonValue -Node $member.Value
        }
    }

    return $null
}
