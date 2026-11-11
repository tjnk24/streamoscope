function Invoke-BridgeLaunch {
    param(
        [Parameter(Mandatory)][string]$InstallRoot,
        [string]$EarlyCommand = '',
        [string]$LateCommand = '',
        [bool]$IsLoadingFinished = $true,
        [int]$ElapsedSeconds = 6,
        [switch]$SameProcess
    )

    $trialPath = Join-Path $InstallRoot 'update-trial.txt'

    if ((Test-Path -LiteralPath $trialPath) -and -not $SameProcess) {
        $trialText = [System.IO.File]::ReadAllText($trialPath)

        [System.IO.File]::WriteAllText($trialPath, ($trialText -replace 'process=\d+', "process=$($script:FakeProcessId)"))
    }

    $source = (Get-BridgeSource -InstallRoot $InstallRoot -ScenarioFileName 'rollback.lua').
        Replace('__EARLY_COMMAND__', $EarlyCommand).
        Replace('__LATE_COMMAND__', $LateCommand).
        Replace('__FINISHED__', $IsLoadingFinished.ToString().ToLowerInvariant()).
        Replace('__ELAPSED__', [string]$ElapsedSeconds)

    $result = Invoke-LuaSource -Source $source

    if ($result.IsFailed) {
        return [pscustomobject]@{
            Version = 'ERROR'
            Error = $result.Text
            RolledBack = $script:NoBridgeResult
            Available = $script:NoBridgeResult
            Stub = $script:NoBridgeResult
        }
    }

    $bridgePath, $rolledBack, $available, $stub = $result.Text -split '\|'

    return [pscustomobject]@{
        Version = ($bridgePath.TrimEnd('/') -split '/')[-1]
        Error = ''
        RolledBack = $rolledBack
        Available = $available
        Stub = $stub
    }
}
