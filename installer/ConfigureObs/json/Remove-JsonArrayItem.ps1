function Remove-JsonArrayItem {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)]$Array,
        [AllowEmptyCollection()][object[]]$Kept = @()
    )

    $items = @($Array.Items)
    $keptStarts = @($Kept | ForEach-Object { $_.Start })
    $keptIndexes = @(for ($itemIndex = 0; $itemIndex -lt $items.Count; $itemIndex++) {
        if ($keptStarts -contains $items[$itemIndex].Start) {
            $itemIndex
        }
    })

    if ($keptIndexes.Count -eq 0) {
        $arrayText = '[]'
    } else {
        $parts = New-Object System.Collections.Generic.List[string]
        $parts.Add($Text.Substring($Array.Start, $items[0].Start - $Array.Start))

        for ($keptPosition = 0; $keptPosition -lt $keptIndexes.Count; $keptPosition++) {
            $item = $items[$keptIndexes[$keptPosition]]
            $parts.Add($Text.Substring($item.Start, $item.End - $item.Start))

            if ($keptPosition -lt $keptIndexes.Count - 1) {
                $nextItem = $items[$keptIndexes[$keptPosition] + 1]
                $parts.Add($Text.Substring($item.End, $nextItem.Start - $item.End))
            }
        }

        $lastItem = $items[$items.Count - 1]
        $parts.Add($Text.Substring($lastItem.End, $Array.End - $lastItem.End))
        $arrayText = -join $parts
    }

    return $Text.Remove($Array.Start, $Array.End - $Array.Start).Insert($Array.Start, $arrayText)
}
