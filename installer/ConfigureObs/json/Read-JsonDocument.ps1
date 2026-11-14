function Read-JsonDocument {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text
    )

    $root = Read-JsonValue -Text $Text -Position 0
    $rest = $Text.Substring($root.End).Trim()

    if ($rest.Length -gt 0) {
        throw "Unexpected text after JSON at position $($root.End)"
    }

    return Expand-JsonValue -Node $root
}
