[CmdletBinding(DefaultParameterSetName = 'Manual')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Manual')][string]$Version,
    [Parameter(Mandatory, ParameterSetName = 'Auto')][switch]$Auto,
    [string]$InstallDirectory,
    [string]$StatusPath = (Join-Path $env:LOCALAPPDATA 'streamoscope\update-status.json'),
    [string]$ReleaseBaseUrl = 'https://github.com/tjnk24/streamoscope/releases/download',
    [string]$LatestReleaseUrl = 'https://api.github.com/repos/tjnk24/streamoscope/releases/latest',
    [string]$PublicKey = 'RWRzpUdJutr3gDJeHN8YtU6E/Vw3Am48D72eSvZaX1EWA69uhrc6f3f2',
    [string]$MinisignPath
)

$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path

if ([string]::IsNullOrEmpty($InstallDirectory)) {
    $InstallDirectory = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $scriptDirectory))
}

if ([string]::IsNullOrEmpty($MinisignPath)) {
    $MinisignPath = Join-Path $InstallDirectory 'updater\minisign.exe'
}

$env:PSModulePath = @(
    (Join-Path $env:ProgramFiles 'WindowsPowerShell\Modules'),
    (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\Modules')
) -join ';'

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

Get-ChildItem -LiteralPath (Join-Path $scriptDirectory 'UpdateWidget') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

$findObsDirectoryPath = Join-Path (Split-Path -Parent $scriptDirectory) 'ConfigureObs\paths\Find-ObsDirectory.ps1'

if (-not (Test-Path -LiteralPath $findObsDirectoryPath)) {
    $findObsDirectoryPath = Join-Path $InstallDirectory 'ConfigureObs\paths\Find-ObsDirectory.ps1'
}

. $findObsDirectoryPath

$updateArguments = @{
    InstallDirectory = $InstallDirectory
    StatusPath = $StatusPath
    ReleaseBaseUrl = $ReleaseBaseUrl
    PublicKey = $PublicKey
    MinisignPath = $MinisignPath
}

try {
    if ($Auto) {
        [System.Diagnostics.Process]::GetCurrentProcess().PriorityClass = 'BelowNormal'

        $result = Invoke-AutoUpdate @updateArguments -LatestReleaseUrl $LatestReleaseUrl
    } else {
        $result = Invoke-UpdateWidget @updateArguments -Version $Version
    }
} catch {
    if (-not $Auto) {
        Write-UpdateStatus -Path $StatusPath -Version $Version -Stage 'failed' -ErrorCode 'unexpected'
    }

    $result = 'unexpected'
}

exit $(if ($script:SuccessfulResults -contains $result) { 0 } else { 1 })
