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

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'outputs.lua')

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
