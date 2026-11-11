BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    $script:cyrillicFolder = -join [char[]](0x041F, 0x0440, 0x043E, 0x0433, 0x0440, 0x0430, 0x043C, 0x043C, 0x044B)
}

Describe 'Read-JsonDocument' {
    It 'reads nested values with positions' {
        $text = '{"a": [1, 2.5e-3, {"b": "x\"y"}], "c": null}'
        $root = Read-JsonDocument -Text $text
        $array = Get-JsonMember -Node $root -Key 'a'

        $array.Kind | Should -Be 'array'
        $array.Items.Count | Should -Be 3
        $text.Substring($array.Items[1].Start, $array.Items[1].End - $array.Items[1].Start) | Should -Be '2.5e-3'
        (Get-JsonMember -Node $array.Items[2] -Key 'b').Value | Should -Be 'x"y'
        (Get-JsonMember -Node $root -Key 'c').Value | Should -Be 'null'
    }

    It 'unescapes unicode and slashes in strings' {
        $root = Read-JsonDocument -Text '{"name": "Caf\u00e9 \\ \/ \n"}'

        (Get-JsonMember -Node $root -Key 'name').Value | Should -Be ("Caf$([char]0x00E9) \ / " + "`n")
    }

    It 'rejects broken JSON' -TestCases @(
        @{Text = '{"a": 1,}'},
        @{Text = '{"a": "unterminated}'},
        @{Text = '[1, 2'},
        @{Text = '{"a": 1} trailing'},
        @{Text = ''},
        @{Text = '{"a": "bad \ escape"}'},
        @{Text = '{"a": "short \u12"}'},
        @{Text = "{`"a`": `"raw`nnewline`"}"},
        @{Text = "{`"a`": `"raw`ttab`"}"}
    ) {
        param($Text)

        { Read-JsonDocument -Text $Text } | Should -Throw
    }
}

Describe 'Fixtures' {
    It 'are valid JSON: <Name>' -TestCases @(
        Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'fixtures') -Recurse -File |
            Where-Object { $_.Name -match '\.json' } |
            ForEach-Object { @{Name = $_.FullName.Substring($PSScriptRoot.Length + 1); Path = $_.FullName} }
    ) {
        param($Path)

        { Read-JsonDocument -Text (Read-TextFile -Path $Path).Text } | Should -Not -Throw
    }
}

Describe 'Add-BridgeScript' {
    It 'creates modules when the collection has none' {
        $result = Add-BridgeScript -CollectionText '{"name": "Scene"}' -ScriptPath 'C:/obs/bridge.lua'
        $root = $result.Text | ConvertFrom-Json

        $result.Changed | Should -BeTrue
        $root.modules.'scripts-tool'[0].path | Should -Be 'C:/obs/bridge.lua'
        $root.name | Should -Be 'Scene'
    }

    It 'adds scripts-tool to modules and keeps the rest of the text' {
        $original = "{`n    `"modules`": {`n        `"captions`": {`"enabled`": false}`n    }`n}`n"
        $result = Add-BridgeScript -CollectionText $original -ScriptPath 'C:/obs/bridge.lua'

        $result.Text.Replace('"scripts-tool": [{"path": "C:/obs/bridge.lua", "settings": {}}], ', '') | Should -BeExactly $original
    }

    It 'fills an empty scripts-tool array' {
        $result = Add-BridgeScript -CollectionText '{"modules": {"scripts-tool": []}}' -ScriptPath 'C:/obs/bridge.lua'

        $result.Text | Should -BeExactly '{"modules": {"scripts-tool": [{"path": "C:/obs/bridge.lua", "settings": {}}]}}'
    }

    It 'appends after existing scripts without touching them' {
        $original = "{`"modules`": {`"scripts-tool`": [`n    {`"path`": `"C:/other.lua`", `"settings`": {`"x`": 1.0}}`n]}}"
        $result = Add-BridgeScript -CollectionText $original -ScriptPath 'C:/obs/bridge.lua'

        $result.Text.Replace(', {"path": "C:/obs/bridge.lua", "settings": {}}', '') | Should -BeExactly $original
    }

    It 'does not add the script twice, whatever the slashes and case' {
        $original = '{"modules": {"scripts-tool": [{"path": "c:\\OBS\\Bridge.lua", "settings": {}}]}}'
        $result = Add-BridgeScript -CollectionText $original -ScriptPath 'C:/obs/bridge.lua'

        $result.Changed | Should -BeFalse
        $result.Text | Should -BeExactly $original
    }

    It 'stores Windows paths with forward slashes and keeps Cyrillic' {
        $path = "C:\Users\$script:cyrillicFolder\bridge.lua"
        $result = Add-BridgeScript -CollectionText '{"modules": {}}' -ScriptPath $path

        ($result.Text | ConvertFrom-Json).modules.'scripts-tool'[0].path | Should -Be "C:/Users/$script:cyrillicFolder/bridge.lua"
    }
}

Describe 'Remove-BridgeScript' {
    It 'removes only the bridge script' {
        $original = '{"modules": {"scripts-tool": [{"path": "C:/other.lua", "settings": {}}, {"path": "C:/obs/bridge.lua", "settings": {}}]}}'
        $result = Remove-BridgeScript -CollectionText $original -ScriptPath 'C:\obs\bridge.lua'

        $result.Changed | Should -BeTrue
        $result.Text | Should -BeExactly '{"modules": {"scripts-tool": [{"path": "C:/other.lua", "settings": {}}]}}'
    }

    It 'leaves collections without the script unchanged' -TestCases @(
        @{Text = '{"name": "Scene"}'},
        @{Text = '{"modules": {"scripts-tool": []}}'},
        @{Text = '{"modules": {"scripts-tool": [{"path": "C:/other.lua", "settings": {}}]}}'}
    ) {
        param($Text)

        $result = Remove-BridgeScript -CollectionText $Text -ScriptPath 'C:/obs/bridge.lua'

        $result.Changed | Should -BeFalse
        $result.Text | Should -BeExactly $Text
    }
}

Describe 'Add-BrowserDock' {
    It 'creates the list when there is none' -TestCases @(@{Json = $null}, @{Json = ''}, @{Json = '[]'}) {
        param($Json)

        $result = Add-BrowserDock -DocksJson $Json -Title 'StreamoScope' -Url 'file:///C:/dock/index.html' -Uuid 'abc'

        $result.Json | Should -BeExactly '[{"title": "StreamoScope", "url": "file:///C:/dock/index.html", "uuid": "abc"}]'
    }

    It 'appends in the format OBS writes and keeps other docks' {
        $original = '[{"title": "Chat", "url": "https://example.com/chat", "uuid": "1"}]'
        $result = Add-BrowserDock -DocksJson $original -Title 'StreamoScope' -Url 'file:///C:/dock/index.html' -Uuid 'abc'

        $result.Json | Should -BeExactly ($original.TrimEnd(']') + ', {"title": "StreamoScope", "url": "file:///C:/dock/index.html", "uuid": "abc"}]')
    }

    It 'keeps a dock that already has this address' {
        $original = '[{"title": "Stats", "url": "file:///C:/dock/index.html", "uuid": "existing"}]'
        $result = Add-BrowserDock -DocksJson $original -Title 'StreamoScope' -Url 'file:///C:/dock/index.html' -Uuid 'abc'

        $result.Changed | Should -BeFalse
        $result.Uuid | Should -Be 'existing'
    }

    It 'moves its own dock to a new address' {
        $original = '[{"title": "StreamoScope", "url": "file:///C:/old/index.html", "uuid": "abc"}]'
        $result = Add-BrowserDock -DocksJson $original -Title 'StreamoScope' -Url 'file:///C:/new/index.html' -Uuid 'abc'

        $result.Json | Should -BeExactly '[{"title": "StreamoScope", "url": "file:///C:/new/index.html", "uuid": "abc"}]'
    }

    It 'picks a free title when another dock uses it' {
        $original = '[{"title": "StreamoScope", "url": "https://other", "uuid": "1"}, {"title": "StreamoScope (2)", "url": "https://other2", "uuid": "2"}]'
        $result = Add-BrowserDock -DocksJson $original -Title 'StreamoScope' -Url 'file:///C:/dock/index.html' -Uuid 'abc'

        (Read-JsonDocument -Text $result.Json).Items.Count | Should -Be 3
        $result.Json | Should -Match '"title": "StreamoScope \(3\)"'
    }
}

Describe 'Remove-BrowserDock' {
    BeforeAll {
        $script:docks = '[{"title": "Chat", "url": "https://example.com/chat", "uuid": "1"}, {"title": "StreamoScope", "url": "file:///C:/dock/index.html", "uuid": "abc"}]'
    }

    It 'removes the dock by uuid' {
        (Remove-BrowserDock -DocksJson $script:docks -Uuid 'abc' -Url $null).Json | Should -BeExactly '[{"title": "Chat", "url": "https://example.com/chat", "uuid": "1"}]'
    }

    It 'removes the dock by address when the uuid is unknown' {
        (Remove-BrowserDock -DocksJson $script:docks -Uuid $null -Url 'file:///C:/dock/index.html').Json | Should -BeExactly '[{"title": "Chat", "url": "https://example.com/chat", "uuid": "1"}]'
    }

    It 'changes nothing when the dock is gone' {
        $result = Remove-BrowserDock -DocksJson '[{"title": "Chat", "url": "https://example.com/chat", "uuid": "1"}]' -Uuid 'abc' -Url 'file:///C:/dock/index.html'

        $result.Changed | Should -BeFalse
    }
}

Describe 'Get-IniValue and Set-IniValue' {
    BeforeAll {
        $script:ini = "[General]`nName=general`n`n[BasicWindow]`nName=window`nOther=1`n`n[Audio]`nRate=48000`n"
    }

    It 'reads a key only from its section' {
        Get-IniValue -Text $script:ini -Section 'BasicWindow' -Key 'Name' | Should -Be 'window'
        Get-IniValue -Text $script:ini -Section 'BasicWindow' -Key 'Missing' | Should -BeNullOrEmpty
    }

    It 'replaces only the line in the section' {
        Set-IniValue -Text $script:ini -Section 'BasicWindow' -Key 'Name' -Value 'new' | Should -BeExactly $script:ini.Replace('Name=window', 'Name=new')
    }

    It 'adds a missing key to its section' {
        Set-IniValue -Text $script:ini -Section 'Audio' -Key 'Channels' -Value '2' | Should -BeExactly $script:ini.Replace("[Audio]`n", "[Audio]`nChannels=2`n")
    }

    It 'adds a missing section at the end' {
        Set-IniValue -Text $script:ini -Section 'OBSWebSocket' -Key 'ServerEnabled' -Value 'true' | Should -BeExactly ($script:ini + "[OBSWebSocket]`nServerEnabled=true`n")
    }

    It 'keeps Windows line endings' {
        $crlf = $script:ini.Replace("`n", "`r`n")

        Set-IniValue -Text $crlf -Section 'BasicWindow' -Key 'Name' -Value 'new' | Should -BeExactly $crlf.Replace('Name=window', 'Name=new')
    }
}

Describe 'Remove-IniSection' {
    BeforeAll {
        $script:sections = "[General]`nName=general`n`n[StreamoScope]`nPluginOutputs={}`nJournalLines=`n`n[Audio]`nRate=48000`n"
        $script:withoutBridge = "[General]`nName=general`n`n[Audio]`nRate=48000`n"
    }

    It 'removes a section in the middle and keeps one blank line between the others' {
        Remove-IniSection -Text $script:sections -Section 'StreamoScope' | Should -BeExactly $script:withoutBridge
    }

    It 'removes the last section with all its keys' {
        $lastSection = "[General]`nName=general`n`n[StreamoScope]`nPluginOutputs={}`n"

        Remove-IniSection -Text $lastSection -Section 'StreamoScope' | Should -BeExactly "[General]`nName=general`n"
    }

    It 'leaves the text alone without the section, a similar name or a key with that name' {
        $similar = "[General]`nStreamoScope=1`n`n[StreamoScopeNotes]`nText=not ours`n"

        Remove-IniSection -Text $similar -Section 'StreamoScope' | Should -BeExactly $similar
    }

    It 'keeps Windows line endings' {
        $crlf = $script:sections.Replace("`n", "`r`n")

        Remove-IniSection -Text $crlf -Section 'StreamoScope' | Should -BeExactly $script:withoutBridge.Replace("`n", "`r`n")
    }
}

Describe 'Enable-WebSocketServer' {
    It 'turns the server on and changes nothing else' {
        $original = "{`n    `"server_enabled`": false,`n    `"server_password`": `"secret`"`n}"
        $result = Enable-WebSocketServer -ConfigText $original

        $result.Text | Should -BeExactly $original.Replace('false', 'true')
    }

    It 'leaves an enabled server alone' {
        (Enable-WebSocketServer -ConfigText '{"server_enabled": true}').Changed | Should -BeFalse
    }

    It 'adds the key when it is missing' {
        (Enable-WebSocketServer -ConfigText '{"server_port": 4455}').Text | Should -BeExactly '{"server_enabled": true, "server_port": 4455}'
    }
}

Describe 'ConvertTo-FileUrl' {
    It 'encodes spaces, Cyrillic, # and %' {
        $url = ConvertTo-FileUrl -Path "C:\$script:cyrillicFolder dir\a#b%c\index.html"

        $url | Should -Be 'file:///C:/%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D1%8B%20dir/a%23b%25c/index.html'
    }
}
