function Invoke-ConfigureObs {
    param(
        [Parameter(Mandatory)][ValidateSet('Install', 'Uninstall', 'Check')][string]$Mode,
        [Parameter(Mandatory)][string]$InstallDirectory,
        [AllowNull()][AllowEmptyString()][string]$ObsDirectory,
        [AllowNull()][AllowEmptyString()][string]$ConfigDirectory,
        [Parameter(Mandatory)][string]$DataDirectory
    )

    New-Item -ItemType Directory -Path $DataDirectory -Force | Out-Null
    $script:ConfigureLogPath = Join-Path $DataDirectory 'configure-obs.log'
    Write-ConfigureLog "$Mode from $InstallDirectory"

    if (Test-ObsRunning) {
        Write-ConfigureLog 'OBS is running'

        return [ConfigureObsResult]::ObsRunning
    }

    if ($Mode -eq 'Check') {
        return [ConfigureObsResult]::Success
    }

    $manifestPath = Join-Path $InstallDirectory 'install-manifest.json'
    $manifest = if (Test-Path -LiteralPath $manifestPath) { Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }

    if ([string]::IsNullOrEmpty($ConfigDirectory) -and [string]::IsNullOrEmpty($ObsDirectory) -and $null -ne $manifest) {
        $ConfigDirectory = $manifest.configDirectory
    }

    $paths = Resolve-ObsPaths -ConfigDirectory $ConfigDirectory -ObsDirectory $ObsDirectory
    Write-ConfigureLog "OBS config: $($paths.ConfigDirectory)"

    if ($null -eq $paths.DocksIni) {
        Write-ConfigureLog 'No global.ini or user.ini: OBS has not been started yet'

        return [ConfigureObsResult]::ObsConfigNotFound
    }

    $dockUrl = ConvertTo-FileUrl -Path (Join-Path $InstallDirectory 'dock\index.html')
    $bridgePath = (Join-Path $InstallDirectory 'streamoscope-bridge.lua').Replace('\', '/')
    $dockUuid = if ($null -ne $manifest) { $manifest.dockUuid } else { $null }

    try {
        $plan = Get-ObsChanges -Mode $Mode -Paths $paths -DockUrl $dockUrl -BridgePath $bridgePath -DockUuid $dockUuid
    } catch {
        Write-ConfigureLog "Unsupported format, nothing changed: $($_.Exception.Message)"

        return [ConfigureObsResult]::UnsupportedFormat
    }

    if ($plan.Changes.Count -gt 0) {
        try {
            Save-ObsChanges -Changes $plan.Changes -BackupRoot (Join-Path $DataDirectory 'backups')
        } catch {
            Write-ConfigureLog "Failed: $($_.Exception.Message)"

            return [ConfigureObsResult]::Failed
        }
    } else {
        Write-ConfigureLog 'Nothing to change'
    }

    if ($Mode -eq 'Uninstall') {
        Remove-Item -LiteralPath $manifestPath -Force -ErrorAction SilentlyContinue
        Write-ConfigureLog 'Done'

        return [ConfigureObsResult]::Success
    }

    $collections = @($plan.Collections)

    if ($null -ne $manifest) {
        $collections = @($manifest.collections) + $collections | Select-Object -Unique
    }

    [ordered]@{
        configDirectory = $paths.ConfigDirectory
        docksIni = $paths.DocksIni
        dockUuid = $plan.DockUuid
        dockUrl = $dockUrl
        bridgePath = $bridgePath
        collections = @($collections)
        webSocket = $plan.WebSocket
    } | ConvertTo-Json | Set-Content -LiteralPath $manifestPath -Encoding UTF8

    Write-ConfigureLog "Done, obs-websocket: $($plan.WebSocket)"

    if ($plan.WebSocket -eq 'notConfigured') {
        return [ConfigureObsResult]::SuccessWithoutWebSocket
    }

    return [ConfigureObsResult]::Success
}
