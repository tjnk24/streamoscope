param(
    [ValidateSet('Install', 'Uninstall', 'Check')][string]$Mode = 'Install',
    [string]$InstallDirectory,
    [string]$ObsDirectory,
    [string]$ConfigDirectory,
    [string]$DataDirectory = (Join-Path $env:LOCALAPPDATA 'streamoscope')
)

$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path

if ([string]::IsNullOrEmpty($InstallDirectory)) {
    $InstallDirectory = $scriptDirectory
}

$env:PSModulePath = @(
    (Join-Path $env:ProgramFiles 'WindowsPowerShell\Modules'),
    (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\Modules')
) -join ';'

Get-ChildItem -LiteralPath (Join-Path $scriptDirectory 'ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

try {
    $result = Invoke-ConfigureObs -Mode $Mode -InstallDirectory $InstallDirectory -ObsDirectory $ObsDirectory -ConfigDirectory $ConfigDirectory -DataDirectory $DataDirectory
} catch {
    Write-ConfigureLog "Unexpected error: $($_.Exception.Message)"
    $result = [ConfigureObsResult]::Failed
}

exit [int]$result
