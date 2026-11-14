function Expand-JsonValue {
    param(
        [AllowNull()]$Node
    )

    if ($null -eq $Node -or ($Node.Kind -ne 'object' -and $Node.Kind -ne 'array') -or $null -ne $Node.Members) {
        return $Node
    }

    $text = $Node.Document
    $isObject = $Node.Kind -eq 'object'
    $closing = if ($isObject) { '}' } else { ']' }
    $members = [System.Collections.Generic.List[object]]::new()
    $items = [System.Collections.Generic.List[object]]::new()
    $cursor = $Node.Start + 1
    $cursor += $script:JsonWhitespace.Match($text, $cursor).Length

    if ($text[$cursor] -ne $closing) {
        while ($true) {
            if ($isObject) {
                $key = Read-JsonValue -Text $text -Position $cursor

                if ($key.Kind -ne 'string') {
                    throw "Expected a key at position $($key.Start)"
                }

                $cursor = $key.End + $script:JsonWhitespace.Match($text, $key.End).Length

                if ($cursor -ge $text.Length -or $text[$cursor] -ne ':') {
                    throw "Expected ':' at position $cursor"
                }

                $value = Read-JsonValue -Text $text -Position ($cursor + 1)
                $members.Add([pscustomobject]@{Key = $key.Value; KeyStart = $key.Start; Value = $value})
            } else {
                $value = Read-JsonValue -Text $text -Position $cursor
                $items.Add($value)
            }

            $cursor = $value.End + $script:JsonWhitespace.Match($text, $value.End).Length

            if ($cursor -lt $text.Length -and $text[$cursor] -eq ',') {
                $cursor += 1

                continue
            }

            break
        }
    }

    if ($cursor -ge $text.Length -or $text[$cursor] -ne $closing -or $cursor + 1 -ne $Node.End) {
        throw "Expected ',' or '$closing' at position $cursor"
    }

    $Node.Members = $members
    $Node.Items = $items

    return $Node
}
