function Read-JsonValue {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][int]$Position
    )

    $Position += $script:JsonWhitespace.Match($Text, $Position).Length

    if ($Position -ge $Text.Length) {
        throw "Unexpected end of JSON at position $Position"
    }

    $character = $Text[$Position]

    if ($character -eq '"') {
        $token = $script:JsonString.Match($Text, $Position)

        if (-not $token.Success) {
            throw "Invalid JSON string at position $Position"
        }

        return [pscustomobject]@{
            Kind = 'string'
            Start = $Position
            End = $Position + $token.Length
            Value = [regex]::Unescape($token.Value.Substring(1, $token.Length - 2))
        }
    }

    if ($character -eq '{' -or $character -eq '[') {
        $kind = if ($character -eq '{') { 'object' } else { 'array' }
        $container = $script:JsonContainer.Match($Text, $Position)

        if (-not $container.Success) {
            throw "Invalid JSON $kind at position $Position"
        }

        return [pscustomobject]@{
            Kind = $kind
            Start = $Position
            End = $Position + $container.Length
            Document = $Text
            Members = $null
            Items = $null
        }
    }

    $token = $script:JsonNumber.Match($Text, $Position)

    if (-not $token.Success -or $token.Length -eq 0) {
        $token = $script:JsonLiteral.Match($Text, $Position)
    }

    if (-not $token.Success -or $token.Length -eq 0) {
        throw "Unexpected character '$character' at position $Position"
    }

    return [pscustomobject]@{
        Kind = 'scalar'
        Start = $Position
        End = $Position + $token.Length
        Value = $token.Value
    }
}
