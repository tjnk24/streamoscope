function Get-ObsChanges {
    param(
        [Parameter(Mandatory)][ValidateSet('Install', 'Uninstall')][string]$Mode,
        [Parameter(Mandatory)]$Paths,
        [Parameter(Mandatory)][string]$DockUrl,
        [Parameter(Mandatory)][string]$BridgePath,
        [AllowNull()][AllowEmptyString()][string]$DockUuid
    )

    $files = [ordered]@{}

    $readFile = {
        param([string]$Path)

        if (-not $files.Contains($Path)) {
            $file = Read-TextFile -Path $Path
            $files[$Path] = [pscustomobject]@{Path = $Path; Text = $file.Text; HasBom = $file.HasBom; Original = $file.Text; Description = @()}
        }

        return $files[$Path]
    }

    $docksFile = & $readFile $Paths.DocksIni
    $docksJson = Get-IniValue -Text $docksFile.Text -Section 'BasicWindow' -Key 'ExtraBrowserDocks'

    if ($Mode -eq 'Install') {
        if ([string]::IsNullOrEmpty($DockUuid)) {
            $DockUuid = [guid]::NewGuid().ToString('N')
        }

        $dock = Add-BrowserDock -DocksJson $docksJson -Title $script:DockTitle -Url $DockUrl -Uuid $DockUuid
        $DockUuid = $dock.Uuid
    } else {
        $dock = Remove-BrowserDock -DocksJson $docksJson -Uuid $DockUuid -Url $DockUrl
    }

    if ($dock.Changed) {
        $docksFile.Text = Set-IniValue -Text $docksFile.Text -Section 'BasicWindow' -Key 'ExtraBrowserDocks' -Value $dock.Json
        $docksFile.Description += 'browser dock'
    }

    $collections = @()

    if (Test-Path -LiteralPath $Paths.ScenesDirectory) {
        $collections = @(Get-ChildItem -LiteralPath $Paths.ScenesDirectory -File | Where-Object { $_.Extension -eq '.json' })
    }

    foreach ($collection in $collections) {
        $collectionFile = & $readFile $collection.FullName

        if ($Mode -eq 'Install') {
            $bridge = Add-BridgeScript -CollectionText $collectionFile.Text -ScriptPath $BridgePath
        } else {
            $bridge = Remove-BridgeScript -CollectionText $collectionFile.Text -ScriptPath $BridgePath
        }

        if ($bridge.Changed) {
            $collectionFile.Text = $bridge.Text
            $collectionFile.Description += 'bridge script'
        }
    }

    if ($Mode -eq 'Uninstall' -and (Test-Path -LiteralPath $Paths.ProfilesDirectory)) {
        $profileSettings = @(Get-ChildItem -LiteralPath $Paths.ProfilesDirectory -Directory |
            ForEach-Object { Join-Path $_.FullName 'basic.ini' } |
            Where-Object { Test-Path -LiteralPath $_ })

        foreach ($profileSettingsPath in $profileSettings) {
            $profileFile = & $readFile $profileSettingsPath

            foreach ($section in $script:BridgeProfileSections) {
                $profileFile.Text = Remove-IniSection -Text $profileFile.Text -Section $section
            }

            if ($profileFile.Text -cne $profileFile.Original) {
                $profileFile.Description += 'bridge data'
            }
        }
    }

    $webSocket = 'unchanged'

    if ($Mode -eq 'Install') {
        $webSocket = 'notConfigured'

        if (-not [string]::IsNullOrEmpty($Paths.WebSocketConfig)) {
            $webSocketFile = & $readFile $Paths.WebSocketConfig
            $server = Enable-WebSocketServer -ConfigText $webSocketFile.Text
            $webSocket = 'enabled'

            if ($server.Changed) {
                $webSocketFile.Text = $server.Text
                $webSocketFile.Description += 'obs-websocket server'
            }
        } elseif (Test-Path -LiteralPath $Paths.GlobalIni) {
            $globalFile = & $readFile $Paths.GlobalIni
            $legacyEnabled = Get-IniValue -Text $globalFile.Text -Section 'OBSWebSocket' -Key 'ServerEnabled'

            if ($null -ne $legacyEnabled) {
                $webSocket = 'enabled'

                if ($legacyEnabled -ne 'true') {
                    $globalFile.Text = Set-IniValue -Text $globalFile.Text -Section 'OBSWebSocket' -Key 'ServerEnabled' -Value 'true'
                    $globalFile.Description += 'obs-websocket server'
                }
            }
        }
    }

    $changes = @($files.Values | Where-Object { $_.Text -cne $_.Original } | ForEach-Object {
        [pscustomobject]@{Path = $_.Path; Text = $_.Text; HasBom = $_.HasBom; Description = $_.Description -join ', '}
    })

    return [pscustomobject]@{
        Changes = $changes
        DockUuid = $DockUuid
        Collections = @($changes | Where-Object { $_.Description -like '*bridge script*' } | ForEach-Object { $_.Path })
        WebSocket = $webSocket
    }
}
