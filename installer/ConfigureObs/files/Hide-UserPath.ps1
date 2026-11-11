function Hide-UserPath {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text
    )

    $hidden = $Text

    foreach ($variableName in $script:LogHiddenFolderVariables) {
        $folder = [Environment]::GetEnvironmentVariable($variableName)

        if ([string]::IsNullOrEmpty($folder)) {
            continue
        }

        foreach ($spelling in @($folder.TrimEnd('\'), $folder.TrimEnd('\').Replace('\', '/'))) {
            $hidden = [regex]::Replace($hidden, [regex]::Escape($spelling), "%$variableName%", 'IgnoreCase')
        }
    }

    return $hidden
}
