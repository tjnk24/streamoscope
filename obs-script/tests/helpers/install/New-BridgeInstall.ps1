function New-BridgeInstall {
    param(
        [Parameter(Mandatory)][string]$WorkDirectory,
        [string]$Trial,
        [switch]$WithoutPrevious,
        [string]$Healthy,
        [hashtable]$Breaks = @{}
    )

    Remove-Item -LiteralPath $WorkDirectory -Recurse -Force -ErrorAction SilentlyContinue

    $installRoot = Join-Path $WorkDirectory 'app'
    $dataDirectory = Join-Path $WorkDirectory 'data'

    New-Item -ItemType Directory -Path $installRoot, $dataDirectory -Force | Out-Null
    $env:LOCALAPPDATA = $dataDirectory

    $versions = if ($WithoutPrevious) { @($script:NewVersion) } else { @($script:NewVersion, $script:PreviousVersion) }

    foreach ($version in $versions) {
        $versionRoot = Join-Path $installRoot "versions\$version"

        Copy-BridgeFiles -TargetDirectory $versionRoot
        New-Item -ItemType Directory -Path (Join-Path $versionRoot 'updater') | Out-Null
        [System.IO.File]::WriteAllText((Join-Path $versionRoot 'updater\Update-Widget.ps1'), 'exit 0')
    }

    Copy-Item -LiteralPath (Join-Path (Get-RepositoryRoot) 'installer\loader\streamoscope-bridge.lua') -Destination $installRoot
    New-Item -ItemType Directory -Path (Join-Path $installRoot 'updater') | Out-Null
    [System.IO.File]::WriteAllBytes((Join-Path $installRoot 'updater\minisign.exe'), [byte[]]@())
    [System.IO.File]::WriteAllText((Join-Path $installRoot 'current-version.js'), ($script:CurrentVersionTemplate -f $script:NewVersion))

    if (-not [string]::IsNullOrEmpty($Trial)) {
        [System.IO.File]::WriteAllText((Join-Path $installRoot 'update-trial.txt'), $Trial)
    }

    if (-not [string]::IsNullOrEmpty($Healthy)) {
        [System.IO.File]::WriteAllText((Join-Path $installRoot 'healthy-version.txt'), $Healthy)
    }

    foreach ($relativePath in $Breaks.Keys) {
        $brokenPath = Join-Path $installRoot "versions\$($script:NewVersion)\$relativePath"

        [System.IO.File]::WriteAllText($brokenPath, $Breaks[$relativePath], (New-Object System.Text.UTF8Encoding($false)))
    }

    return $installRoot
}
