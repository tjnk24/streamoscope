BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Import-LuaLibrary

    $script:OriginalLocalAppData = $env:LOCALAPPDATA
    $script:WorkDirectory = Join-Path $TestDrive $script:UserDirectoryName
}

AfterAll {
    $env:LOCALAPPDATA = $script:OriginalLocalAppData
}

Describe 'Journal of the bridge' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'journal-app'
        $dataDirectory = Join-Path $script:WorkDirectory 'journal-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $script:JournalDirectory = Join-Path $dataDirectory 'streamoscope\logs'

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'journal.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'writes a line when it loads, with the versions and the time zone' {
        $script:Results.loadedLine | Should -Be 'true'
        $script:Results.hasUtcOffset | Should -Be 'true'
    }

    It 'writes the OBS events by itself' {
        $script:Results.streamEvent | Should -Be 'true'
    }

    It 'takes the lines from the dock and erases the parameter' {
        $script:Results.linesLeft | Should -Be 'false'
        $script:Results.firstLine | Should -Be 'true'
    }

    It 'replaces control characters and cuts long lines' {
        $script:Results.controlCharacterCleaned | Should -Be 'true'
        $script:Results.longLineCut | Should -Be 'true'
    }

    It 'writes the sign of life on schedule' {
        $script:Results.aliveTooEarly | Should -Be 'false'
        $script:Results.aliveInTime | Should -Be 'true'
    }

    It 'writes the statistics of active outputs without the panel' {
        $script:Results.outputStats | Should -Be 'true'
        $script:Results.sameNameOutput | Should -Be 'true'
        $script:Results.outputIdLabel | Should -Be 'true'
        $script:Results.unsafeNameCleaned | Should -Be 'true'
        $script:Results.inactiveSkipped | Should -Be 'true'
    }

    It 'keeps the server address out of the statistics' {
        $script:Results.serverHidden | Should -Be 'true'
    }

    It 'writes no statistics when nothing is streaming' {
        $script:Results.silentWithoutStream | Should -Be 'true'
    }

    It 'writes an update failure once' {
        $script:Results.updateFailure | Should -Be 'true'
        $script:Results.updateLoggedOnce | Should -Be 'true'
    }

    It 'stops writing when turned off and keeps the setting' {
        $script:Results.commandLeft | Should -Be 'false'
        $script:Results.settingOff | Should -Be 'off'
        $script:Results.nothingWrittenWhenOff | Should -Be 'true'
    }

    It 'opens the folder through explorer even when turned off' {
        $script:Results.openedCommandLine | Should -Match 'explorer\.exe" ".*\\streamoscope\\logs"$'
    }

    It 'writes again when turned on' {
        $script:Results.settingOn | Should -Be 'on'
        $script:Results.turnedOnLine | Should -Be 'true'
    }

    It 'ignores the lines and commands left in the profile file by the previous launch' {
        $script:Results.staleLinesDropped | Should -Be 'true'
        $script:Results.staleCommandDropped | Should -Be 'nothing'
    }

    It 'keeps two files of up to 5 MB' {
        $script:Results.rotated | Should -Be 'true'
        $script:Results.currentWithinLimit | Should -Be 'true'
        $script:Results.oldWithinLimit | Should -Be 'true'
        @(Get-ChildItem -LiteralPath $script:JournalDirectory).Count | Should -Be 2
    }

    It 'closes the journal with a line when the script unloads' {
        [System.IO.File]::ReadAllText((Join-Path $script:JournalDirectory 'streamoscope.log')) | Should -Match 'unloaded'
    }
}
