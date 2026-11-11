function Resolve-ObsPaths {
    param(
        [AllowNull()][AllowEmptyString()][string]$ConfigDirectory,
        [AllowNull()][AllowEmptyString()][string]$ObsDirectory
    )

    if ([string]::IsNullOrEmpty($ConfigDirectory)) {
        if ([string]::IsNullOrEmpty($ObsDirectory)) {
            $installedObs = Find-ObsDirectory

            if (Test-PortableObs -ObsDirectory $installedObs) {
                $ObsDirectory = $installedObs
            }
        }

        $ConfigDirectory = if ([string]::IsNullOrEmpty($ObsDirectory)) {
            Join-Path $env:APPDATA 'obs-studio'
        } else {
            Join-Path $ObsDirectory 'config\obs-studio'
        }
    }

    $globalIni = Join-Path $ConfigDirectory 'global.ini'
    $locationsText = if (Test-Path -LiteralPath $globalIni) { (Read-TextFile -Path $globalIni).Text } else { '' }

    $resolveLocation = {
        param([string]$Key)

        $base = Get-IniValue -Text $locationsText -Section 'Locations' -Key $Key

        if ([string]::IsNullOrEmpty($base)) {
            return $ConfigDirectory
        }

        $base = $base.Replace('\\', '\')

        if (-not [System.IO.Path]::IsPathRooted($base)) {
            return $ConfigDirectory
        }

        return Join-Path $base 'obs-studio'
    }

    $userDirectory = & $resolveLocation 'Configuration'
    $scenesDirectory = Join-Path (& $resolveLocation 'SceneCollections') 'basic\scenes'
    $profilesDirectory = Join-Path (& $resolveLocation 'Profiles') 'basic\profiles'
    $userIni = Join-Path $userDirectory 'user.ini'

    $docksIni = if (Test-Path -LiteralPath $userIni) {
        $userIni
    } elseif (Test-Path -LiteralPath $globalIni) {
        $globalIni
    } else {
        $null
    }

    $webSocketConfig = @(
        (Join-Path $userDirectory 'plugin_config\obs-websocket\config.json'),
        (Join-Path $ConfigDirectory 'plugin_config\obs-websocket\config.json')
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

    return [pscustomobject]@{
        ConfigDirectory = $ConfigDirectory
        GlobalIni = $globalIni
        DocksIni = $docksIni
        ScenesDirectory = $scenesDirectory
        ProfilesDirectory = $profilesDirectory
        WebSocketConfig = $webSocketConfig
    }
}
