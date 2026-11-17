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

    It 'passes the statistics and the fingerprints of each output with the time of the sample' {
        $script:Results.outputWithStats | Should -Be $script:OutputWithStats
        $script:Results.sampledAtMs | Should -Be '5000'
    }

    It 'passes the key fingerprint of the main stream' {
        $script:Results.mainKeyId | Should -Be 'c4d8e2f1'
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

    It 'computes the key fingerprint from the key and the token only' {
        $script:Results.keyFingerprint | Should -Be (Get-OutputFingerprint -Parts 'live_key', '')
        $script:Results.pointerKeyFingerprint | Should -Be $script:Results.keyFingerprint
        $script:Results.keyFingerprint | Should -Not -Be $script:Results.fingerprint
    }

    It 'computes no key fingerprint without a key and a token' {
        $script:Results.emptyKeyFingerprint | Should -Be 'nil'
    }

    It 'computes nothing after it is closed' {
        $script:Results.closedFingerprint | Should -Be 'nil'
    }
}

Describe 'Key fingerprint of the main stream' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'main-key-app'
        $dataDirectory = Join-Path $script:WorkDirectory 'main-key-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'outputs/main_key.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
    }

    It 'computes it from the key of the current streaming service of OBS' {
        $script:Results.fromConnectInfo | Should -Be (Get-OutputFingerprint -Parts 'main_secret-key', '')
    }

    It 'falls back to the token in the service settings' {
        $script:Results.fromSettings | Should -Be (Get-OutputFingerprint -Parts '', 'secret-token')
    }

    It 'computes nothing without a key, without a service and for a service being destroyed' {
        $script:Results.withoutKey | Should -Be 'nil'
        $script:Results.withoutService | Should -Be 'nil'
        $script:Results.destroyedService | Should -Be 'nil'
    }

    It 'releases each reference to the service it takes and each settings object' {
        $script:Results.referencesTaken | Should -Be '3'
        $script:Results.referencesLeft | Should -Be '0'
        $script:Results.settingsLeft | Should -Be '0'
    }

    It 'computes nothing after it is closed' {
        $script:Results.afterClose | Should -Be 'nil'
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

    It 'passes the enabled targets with the same fingerprints as their output will have and one key fingerprint for one key' {
        $mainId = Get-OutputFingerprint -Parts 'rtmp://streamer:secret-password@live.example.com/app', 'live_secret-key', ''
        $mainKeyId = Get-OutputFingerprint -Parts 'live_secret-key', ''
        $talkShowId = Get-OutputFingerprint -Parts 'https://whip.example.com/whip/endpoint', '', 'secret-token'
        $talkShowKeyId = Get-OutputFingerprint -Parts '', 'secret-token'
        $backupId = Get-OutputFingerprint -Parts 'rtmp://backup.example.com/app', 'live_secret-key', ''

        $expected = '[{"id":"' + $mainId + '","keyId":"' + $mainKeyId + '","name":"multi-output","server":"rtmp://live.example.com","title":"Main channel"},' +
            '{"id":"' + $talkShowId + '","keyId":"' + $talkShowKeyId + '","name":"multi-output","server":"https://whip.example.com","title":"Talk show"},' +
            '{"id":"' + $backupId + '","keyId":"' + $mainKeyId + '","name":"multi-output","server":"rtmp://backup.example.com","title":"Backup server"}]'

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
