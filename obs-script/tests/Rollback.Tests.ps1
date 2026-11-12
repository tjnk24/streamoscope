BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Import-LuaLibrary

    $script:OriginalLocalAppData = $env:LOCALAPPDATA
    $script:WorkDirectory = Join-Path $TestDrive "$($script:UserDirectoryName)\rollback"
    $script:BrokenMain = @{ $script:MainModuleRelativePath = $script:BrokenBridgeSource }
    $script:BrokenLoader = @{ $script:LoaderFileName = "this is not lua`n" }
    $script:GivingUpLoader = @{ $script:LoaderFileName = "error('gave up')`nreturn false`n" }
}

AfterAll {
    $env:LOCALAPPDATA = $script:OriginalLocalAppData
}

Describe 'Bridge loader stub' {
    It 'tells the bridge that it runs under the stub' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory

        (Invoke-BridgeLaunch -InstallRoot $app).Stub | Should -Be '1'
    }

    It 'lets the loader of the previous version judge a version on trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks $script:BrokenMain
        $oldLoaderPath = Join-Path $PSScriptRoot 'harness\loader_0_6_0.lua'

        Copy-Item -LiteralPath $oldLoaderPath -Destination (Join-Path $app "versions\$($script:PreviousVersion)\$($script:LoaderFileName)") -Force

        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be $script:PreviousVersion
        $launch.RolledBack | Should -Be $script:NewVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
    }

    It 'runs the loader of the new version once its trial is over' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)
        $healthyLoaderPath = Join-Path $app 'healthy-loader.txt'

        (Invoke-BridgeLaunch -InstallRoot $app -EarlyCommand "healthy:$($script:NewVersion)").Version | Should -Be $script:NewVersion
        [System.IO.File]::ReadAllText($healthyLoaderPath) | Should -Be $script:PreviousVersion

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
        [System.IO.File]::ReadAllText($healthyLoaderPath) | Should -Be $script:NewVersion
    }

    It 'goes back to the loader that worked last when the new one breaks after its trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks $script:BrokenLoader

        (Invoke-BridgeLaunch -InstallRoot $app -EarlyCommand "healthy:$($script:NewVersion)").Version | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist

        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be $script:PreviousVersion
        $launch.RolledBack | Should -Be $script:NewVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        Join-Path $app 'current-version.js.tmp' | Should -Not -Exist
        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
    }

    It 'falls back to the last healthy version without a trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Healthy $script:PreviousVersion -Breaks $script:BrokenLoader

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        [System.IO.File]::ReadAllText((Join-Path $app 'rolled-back-version.txt')) | Should -Be $script:NewVersion
    }

    It 'falls back when the loader of the new version gives up with false' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Healthy $script:PreviousVersion -Breaks $script:GivingUpLoader

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        [System.IO.File]::ReadAllText((Join-Path $app 'healthy-loader.txt')) | Should -Be $script:PreviousVersion
    }

    It 'stops at a damaged current-version.js without running a loader' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory

        [System.IO.File]::WriteAllText((Join-Path $app 'current-version.js'), 'garbage')

        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Match 'missing or damaged'
        $launch.Error | Should -Not -Match 'attempt to'
        Join-Path $app 'healthy-loader.txt' | Should -Not -Exist
    }

    It 'passes the error on when there is no version to fall back to' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Healthy $script:NewVersion -Breaks $script:BrokenLoader
        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Not -Match 'attempt to'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
    }

    It 'passes the error on when the version to fall back to has no loader' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks $script:BrokenLoader

        Remove-Item -LiteralPath (Join-Path $app "versions\$($script:PreviousVersion)\$($script:LoaderFileName)")

        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Not -Match 'attempt to'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Exist
    }
}

Describe 'Bridge loader rollback' {
    It 'changes nothing without a trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
    }

    It 'runs the previous version in the same session when the bridge throws while loading' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks $script:BrokenMain
        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be $script:PreviousVersion
        $launch.RolledBack | Should -Be $script:NewVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
    }

    It 'rolls back a module with a syntax error' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks @{ 'streamoscope-bridge\publisher.lua' = "this is not lua`n" }

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
    }

    It 'switches the files and passes the error on when the bridge throws in script_load' {
        $mainPath = Join-Path (Get-RepositoryRoot) "obs-script\$($script:MainModuleRelativePath)"
        $mainSource = [System.IO.File]::ReadAllText($mainPath, [System.Text.Encoding]::UTF8).Replace("`r`n", "`n")
        $brokenStart = $mainSource.Replace($script:ScriptLoadLine, "$($script:ScriptLoadLine)    assert(false, 'boom at start')`n")

        $brokenStart | Should -Not -Be $mainSource

        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -Breaks @{ $script:MainModuleRelativePath = $brokenStart }

        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Match 'boom at start'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
    }

    It 'rolls back when the dock stays silent 5 seconds after OBS finished loading' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 6).Version | Should -Be $script:NewVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
        [System.IO.File]::ReadAllText((Join-Path $app 'rolled-back-version.txt')) | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist

        $nextLaunch = Invoke-BridgeLaunch -InstallRoot $app

        $nextLaunch.Version | Should -Be $script:PreviousVersion
        $nextLaunch.RolledBack | Should -Be $script:NewVersion
        $nextLaunch.Available | Should -Be 'true'
    }

    It 'keeps the trial for the next launch when current-version.js cannot be replaced' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)
        $currentVersionFile = Get-Item -LiteralPath (Join-Path $app 'current-version.js')

        $currentVersionFile.IsReadOnly = $true

        try {
            (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 6).Version | Should -Be $script:NewVersion
        } finally {
            $currentVersionFile.IsReadOnly = $false
        }

        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
        Join-Path $app 'current-version.js.tmp' | Should -Not -Exist
        Join-Path $app 'update-trial.txt' | Should -Exist
    }

    It 'gives no verdict before 5 seconds' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 4 | Out-Null

        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Exist
    }

    It 'waits for the fallback when the loading event never comes' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -IsLoadingFinished $false -ElapsedSeconds 29 | Out-Null
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion

        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -IsLoadingFinished $false -ElapsedSeconds 31 | Out-Null
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
    }

    It 'keeps the new version when the dock reports in time' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -EarlyCommand "healthy:$($script:NewVersion)" | Out-Null

        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
        [System.IO.File]::ReadAllText((Join-Path $app 'healthy-version.txt')) | Should -Be $script:NewVersion
        [System.IO.File]::ReadAllText((Join-Path $app 'healthy-process.txt')) | Should -Match '^\d+$'
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist

        foreach ($launchNumber in 1..3) {
            (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion -Because "launch $launchNumber"
        }
    }

    It 'undoes the rollback when a slow dock reports after the verdict' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)
        $launch = Invoke-BridgeLaunch -InstallRoot $app -LateCommand "healthy:$($script:NewVersion)"

        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
        $launch.RolledBack | Should -Be $script:NoBridgeResult
        Join-Path $app 'current-version.js.tmp' | Should -Not -Exist
        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
    }

    It 'rolls back before loading on the third launch when OBS keeps being closed' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 1).Version | Should -Be $script:NewVersion
        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 1).Version | Should -Be $script:NewVersion
        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 1).Version | Should -Be $script:PreviousVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:PreviousVersion
    }

    It 'counts scene collection switches in one OBS process as one launch' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 1).Version | Should -Be $script:NewVersion

        foreach ($switchNumber in 1..4) {
            (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 60 -SameProcess).Version | Should -Be $script:NewVersion -Because "switch $switchNumber"
        }

        [System.IO.File]::ReadAllText((Join-Path $app 'update-trial.txt')) | Should -Match 'launches=1'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
    }

    It 'does not judge the session that downloaded the version' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText -ProcessId $PID)

        (Invoke-BridgeLaunch -InstallRoot $app -ElapsedSeconds 60 -SameProcess).Version | Should -Be $script:NewVersion
        [System.IO.File]::ReadAllText((Join-Path $app 'update-trial.txt')) | Should -Match 'launches=0'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
    }

    It 'records the health of an old dock and goes on with the trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -EarlyCommand "healthy:$($script:PreviousVersion)" -ElapsedSeconds 1 | Out-Null

        Join-Path $app 'update-trial.txt' | Should -Exist
        [System.IO.File]::ReadAllText((Join-Path $app 'healthy-version.txt')) | Should -Be $script:PreviousVersion
    }

    It 'ignores a malformed health command' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText)

        Invoke-BridgeLaunch -InstallRoot $app -EarlyCommand 'healthy:2.0' -ElapsedSeconds 1 | Out-Null

        Join-Path $app 'update-trial.txt' | Should -Exist
        Join-Path $app 'healthy-version.txt' | Should -Not -Exist
    }

    It 'ends the trial without a rollback when silence proves nothing' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText -Panel '0')

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
    }

    It 'still rolls back a broken bridge when silence proves nothing' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText -Panel '0') -Breaks $script:BrokenMain

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:PreviousVersion
    }

    It 'ends the trial when the previous version is gone' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -WithoutPrevious

        Invoke-BridgeLaunch -InstallRoot $app | Out-Null

        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
        Join-Path $app 'rolled-back-version.txt' | Should -Not -Exist
    }

    It 'passes the error on when a broken bridge has no previous version' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText) -WithoutPrevious -Breaks $script:BrokenMain
        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Match 'boom'
        $launch.Error | Should -Not -Match 'attempt to'
    }

    It 'passes the error on when a broken bridge has no trial' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Breaks $script:BrokenMain
        $launch = Invoke-BridgeLaunch -InstallRoot $app

        $launch.Version | Should -Be 'ERROR'
        $launch.Error | Should -Match 'boom'
        $launch.Error | Should -Not -Match 'attempt to'
        Get-CurrentVersion -InstallRoot $app | Should -Be $script:NewVersion
    }

    It 'removes a trial of another version' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial (New-TrialText -Version '3.0.0')

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
    }

    It 'removes a damaged trial file' {
        $app = New-BridgeInstall -WorkDirectory $script:WorkDirectory -Trial 'garbage'

        (Invoke-BridgeLaunch -InstallRoot $app).Version | Should -Be $script:NewVersion
        Join-Path $app 'update-trial.txt' | Should -Not -Exist
    }
}
