$ErrorActionPreference = 'Stop'

$env:PSModulePath = @(
    (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'WindowsPowerShell\Modules'),
    (Join-Path $env:ProgramFiles 'WindowsPowerShell\Modules'),
    (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\Modules')
) -join ';'

$minisign = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\..\node_modules\.cache\minisign') -Recurse -Filter 'minisign.exe' -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match '\\x86_64\\' } |
    Select-Object -First 1

if ($null -eq $minisign) {
    throw 'minisign.exe is not in node_modules\.cache\minisign, run: node scripts/buildInstaller/fetchMinisign.ts'
}

$env:STREAMOSCOPE_MINISIGN = $minisign.FullName

Import-Module Pester -MinimumVersion 5.0

$configuration = New-PesterConfiguration
$configuration.Run.Path = $PSScriptRoot
$configuration.Run.Exit = $true
$configuration.Output.Verbosity = 'Normal'

Invoke-Pester -Configuration $configuration
