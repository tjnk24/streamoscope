BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Import-LuaLibrary

    $script:OriginalLocalAppData = $env:LOCALAPPDATA
    $script:WorkDirectory = Join-Path $TestDrive $script:UserDirectoryName
}

AfterAll {
    $env:LOCALAPPDATA = $script:OriginalLocalAppData
    $env:MARKER_FILE = $null
}

Describe 'Bridge installed with versions' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'app'
        $versionRoot = Join-Path $installRoot 'versions\9.9.9'
        $dataDirectory = Join-Path $script:WorkDirectory 'data'
        $marker = Join-Path $script:WorkDirectory 'called.txt'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $versionRoot
        Copy-Item -LiteralPath (Join-Path (Get-RepositoryRoot) 'obs-script\streamoscope-bridge.lua') -Destination $installRoot
        New-Item -ItemType Directory -Path (Join-Path $installRoot 'updater'), (Join-Path $versionRoot 'updater') | Out-Null
        [System.IO.File]::WriteAllBytes((Join-Path $installRoot 'updater\minisign.exe'), [byte[]]@())
        [System.IO.File]::WriteAllText((Join-Path $versionRoot 'updater\Update-Widget.ps1'), $script:UpdaterStub)
        [System.IO.File]::WriteAllText((Join-Path $installRoot 'current-version.js'), ($script:CurrentVersionTemplate -f '9.9.9'))
        [System.IO.File]::WriteAllText($marker, '')

        $env:LOCALAPPDATA = $dataDirectory
        $env:MARKER_FILE = $marker

        $script:InstallRoot = $installRoot

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'commands.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'takes the bridge from the folder of the current version' {
        $script:Results.scriptPath | Should -Be ($script:InstallRoot.Replace('\', '/') + '/versions/9.9.9/')
    }

    It 'describes itself to OBS' {
        $script:Results.description | Should -Match 'Tells the StreamoScope dock'
    }

    It 'publishes the bridge version from consts.lua' {
        $consts = [System.IO.File]::ReadAllText((Join-Path (Get-RepositoryRoot) 'obs-script\streamoscope-bridge\consts.lua'))
        $bridgeVersion = [regex]::Match($consts, 'BRIDGE_VERSION\s*=\s*(\d+)').Groups[1].Value

        $script:Results.bridgeVersion | Should -Be $bridgeVersion
    }

    It 'reports that the updater is available' {
        $script:Results.update | Should -Match '"available":true'
    }

    It 'erases an update command left in the profile file by the previous launch' {
        $script:Results.staleCommandLeftAfterLoad | Should -Be 'false'
    }

    It 'runs nothing before the start delay' {
        $script:Results.tickBeforeDelay | Should -Be 'nothing'
    }

    It 'takes the install command and runs the updater with the version' {
        $script:Results.installCommandLeft | Should -Be 'false'
        $script:Results.installCalledWith | Should -Be 'version=1.2.3 auto=False'
    }

    It 'erases a malformed command without running anything' {
        $script:Results.badCommandLeft | Should -Be 'false'
    }

    It 'starts the background check after the delay' {
        $script:Results.autoCalledWith | Should -Be 'version= auto=True'
    }

    It 'stores auto:off and skips the daily check' {
        $script:Results.settingAfterOff | Should -Be 'off'
        $script:Results.afterOffCalledWith | Should -Be 'nothing'
    }

    It 'stores auto:on and checks again' {
        $script:Results.settingAfterOn | Should -Be 'on'
        $script:Results.afterOnCalledWith | Should -Be 'version= auto=True'
    }
}

Describe 'Opening a release page' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'links'
        $dataDirectory = Join-Path $script:WorkDirectory 'links-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'release_links.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:LinkResults = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'does not open a page left in the profile file by the previous launch' {
        $script:LinkResults.staleCommandLeft | Should -Be 'false'
        $script:LinkResults.staleCommandOpened | Should -Be '0'
    }

    It 'opens a page asked for after the load' {
        $script:LinkResults.freshCommandOpened | Should -Be '1'
    }

    It 'opens a page of the local test release server' {
        $script:LinkResults.testServerOpened | Should -Be '2'
    }

    It 'opens nothing for user info, a missing port or path, a foreign host, quotes or an overlong address' {
        $script:LinkResults.rejectedOpened | Should -Be '2'
        $script:LinkResults.rejectedCommandLeft | Should -Be 'false'
    }
}

Describe 'Bridge copied by hand into one folder' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'flat'
        $dataDirectory = Join-Path $script:WorkDirectory 'flat-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory
        $env:MARKER_FILE = ''

        $script:InstallRoot = $installRoot

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'commands.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'takes the bridge from the same folder' {
        $script:Results.scriptPath | Should -Be ($script:InstallRoot.Replace('\', '/') + '/')
    }

    It 'reports that there is no updater' {
        $script:Results.update | Should -Match '"available":false'
    }
}
