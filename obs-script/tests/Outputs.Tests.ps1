BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Import-LuaLibrary

    $script:OriginalLocalAppData = $env:LOCALAPPDATA
    $script:WorkDirectory = Join-Path $TestDrive $script:UserDirectoryName
}

AfterAll {
    $env:LOCALAPPDATA = $script:OriginalLocalAppData
}

Describe 'Outputs passed by the bridge' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'outputs-app'
        $dataDirectory = Join-Path $script:WorkDirectory 'outputs-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'outputs/outputs.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'passes the statistics and the fingerprint of each output with the time of the sample' {
        $script:Results.outputWithStats | Should -Be $script:OutputWithStats
        $script:Results.sampledAtMs | Should -Be '5000'
    }

    It 'keeps outputs of the fallback path as they were' {
        $script:Results.fallbackOutput | Should -Be $script:FallbackOutput
    }

    It 'passes neither the path nor the login of the server' {
        $script:Results.secretsHidden | Should -Be 'true'
    }

    It 'computes the fingerprint as HMAC-SHA256 with the secret of this computer' {
        $script:Results.fingerprint | Should -Be (Get-OutputFingerprint -Parts 'rtmp://live.example.com/app', 'live_key', '')
    }

    It 'reads the key from a C string without turning it into a Lua string' {
        $script:Results.pointerFingerprint | Should -Be $script:Results.fingerprint
    }

    It 'gives another fingerprint for another key' {
        $script:Results.otherKeyFingerprint | Should -Not -Be $script:Results.fingerprint
    }

    It 'computes nothing after it is closed' {
        $script:Results.closedFingerprint | Should -Be 'nil'
    }
}

Describe 'Targets of obs-multi-rtmp known before they start' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'configured-app'
        $dataDirectory = Join-Path $script:WorkDirectory 'configured-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'outputs/configured_targets.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
        $script:JournalText = [System.IO.File]::ReadAllText((Join-Path $dataDirectory 'streamoscope\logs\streamoscope.log'))
    }

    It 'passes the enabled targets with the same fingerprint as their output will have' {
        $mainId = Get-OutputFingerprint -Parts 'rtmp://streamer:secret-password@live.example.com/app', 'live_secret-key', ''
        $talkShowId = Get-OutputFingerprint -Parts 'https://whip.example.com/whip/endpoint', '', 'secret-token'

        $expected = '[{"id":"' + $mainId + '","name":"multi-output","server":"rtmp://live.example.com","title":"Main channel"},' +
            '{"id":"' + $talkShowId + '","name":"multi-output","server":"https://whip.example.com","title":"Talk show"}]'

        $script:Results.configured | Should -Be $expected
    }

    It 'passes nothing before the profile is known and without the file' {
        $script:Results.beforeProfile | Should -Be '[]'
        $script:Results.withoutFile | Should -Be '[]'
    }

    It 'passes neither the keys nor the path and the login of the server' {
        $script:Results.secretsHidden | Should -Be 'true'
        $script:JournalText.Contains('secret') | Should -BeFalse
    }

    It 'reads the file again only after a few seconds' {
        $script:Results.cachedUntilRefresh | Should -Be 'true'
        $script:Results.afterRefresh | Should -Be '[]'
    }

    It 'passes nothing for a file it does not understand and writes the plugin version once' {
        $info = (Get-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\kernel32.dll')).VersionInfo
        $version = '{0}.{1}.{2}.{3}' -f $info.FileMajorPart, $info.FileMinorPart, $info.FileBuildPart, $info.FilePrivatePart
        $line = "obs-multi-rtmp settings not understood plugin=$version"

        $script:Results.notUnderstood | Should -Be '[]'
        ([regex]::Matches($script:JournalText, [regex]::Escape($line))).Count | Should -Be 1
    }

    It 'passes nothing after it is closed' {
        $script:Results.afterClose | Should -Be '0'
    }
}
