BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    $script:fixtures = Join-Path $PSScriptRoot 'fixtures'
    $script:cyrillicFolder = -join [char[]](0x041F, 0x0440, 0x043E, 0x0433, 0x0440, 0x0430, 0x043C, 0x043C, 0x044B)
    $script:cyrillicCollection = (-join [char[]](0x041C, 0x043E, 0x0438, 0x0020, 0x0441, 0x0446, 0x0435, 0x043D, 0x044B)) + '.json'

    function New-ObsFixture {
        param([string]$Name)

        $root = Join-Path $TestDrive ([guid]::NewGuid().ToString('N'))
        $config = Join-Path $root 'obs-studio'

        New-Item -ItemType Directory -Path $root -Force | Out-Null

        if ($Name) {
            Copy-Item -LiteralPath (Join-Path $script:fixtures $Name) -Destination $config -Recurse
        } else {
            New-Item -ItemType Directory -Path $config | Out-Null
        }

        $globalIni = Join-Path $config 'global.ini'

        if (Test-Path -LiteralPath $globalIni) {
            $file = Read-TextFile -Path $globalIni
            Write-TextFile -Path $globalIni -Text $file.Text.Replace('__ROOT__', $root.Replace('\', '\\')) -HasBom $file.HasBom
        }

        $install = Join-Path $root "$script:cyrillicFolder and spaces\streamoscope"
        New-Item -ItemType Directory -Path $install -Force | Out-Null

        return [pscustomobject]@{
            Root = $root
            Config = $config
            Install = $install
            Data = Join-Path $root 'data'
            DockUrl = ConvertTo-FileUrl -Path (Join-Path $install 'dock\index.html')
            BridgePath = (Join-Path $install 'streamoscope-bridge.lua').Replace('\', '/')
        }
    }

    function Invoke-Fixture {
        param($Fixture, [string]$Mode = 'Install')

        return Invoke-ConfigureObs -Mode $Mode -InstallDirectory $Fixture.Install -ConfigDirectory $Fixture.Config -DataDirectory $Fixture.Data
    }

    function Get-Hashes {
        param([string]$Directory)

        $hashes = [ordered]@{}

        Get-ChildItem -LiteralPath $Directory -Recurse -File | Sort-Object FullName | ForEach-Object {
            $hashes[$_.FullName] = (Get-FileHash -LiteralPath $_.FullName).Hash
        }

        return ($hashes.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "`n"
    }

    function Get-BridgePaths {
        param([string]$Path)

        $root = Read-JsonDocument -Text (Read-TextFile -Path $Path).Text

        return @((Get-JsonMember -Node (Get-JsonMember -Node $root -Key 'modules') -Key 'scripts-tool').Items | ForEach-Object { (Get-JsonMember -Node $_ -Key 'path').Value })
    }

    function Get-Docks {
        param([string]$Path)

        $docks = ConvertFrom-Json -InputObject (Get-IniValue -Text (Read-TextFile -Path $Path).Text -Section 'BasicWindow' -Key 'ExtraBrowserDocks')

        foreach ($dock in $docks) {
            $dock
        }
    }

    function ConvertTo-Canonical {
        param([string]$Path)

        return (Read-TextFile -Path $Path).Text | ConvertFrom-Json | ConvertTo-Json -Depth 100 -Compress
    }
}

Describe 'Invoke-ConfigureObs' {
    BeforeEach {
        Mock Test-ObsRunning { $false }
    }

    Context 'OBS 28: everything in global.ini' {
        BeforeAll {
            $script:fixture = New-ObsFixture -Name 'obs-28'
            $script:originalGlobal = (Read-TextFile -Path (Join-Path $script:fixture.Config 'global.ini')).Text
            $script:originalScene = (Read-TextFile -Path (Join-Path $script:fixture.Config 'basic\scenes\Untitled.json')).Text
        }

        It 'installs' {
            Invoke-Fixture -Fixture $script:fixture | Should -Be ([ConfigureObsResult]::Success)
        }

        It 'adds the dock and turns obs-websocket on in global.ini without creating user.ini' {
            $global = (Read-TextFile -Path (Join-Path $script:fixture.Config 'global.ini')).Text
            $docks = @(Get-Docks -Path (Join-Path $script:fixture.Config 'global.ini'))

            $docks.Count | Should -Be 1
            $docks[0].url | Should -Be $script:fixture.DockUrl
            Get-IniValue -Text $global -Section 'OBSWebSocket' -Key 'ServerEnabled' | Should -Be 'true'
            Get-IniValue -Text $global -Section 'OBSWebSocket' -Key 'ServerPassword' | Should -Be 'fixturePassword28'
            Test-Path -LiteralPath (Join-Path $script:fixture.Config 'user.ini') | Should -BeFalse
            (Read-TextFile -Path (Join-Path $script:fixture.Config 'global.ini')).HasBom | Should -BeTrue
        }

        It 'adds the bridge and keeps every other byte of the collection' {
            $scene = (Read-TextFile -Path (Join-Path $script:fixture.Config 'basic\scenes\Untitled.json')).Text
            $entry = '"scripts-tool": [{"path": ' + (ConvertTo-JsonText -Value $script:fixture.BridgePath) + ', "settings": {}}], '

            Get-BridgePaths -Path (Join-Path $script:fixture.Config 'basic\scenes\Untitled.json') | Should -Be @($script:fixture.BridgePath)
            $scene.Replace($entry, '') | Should -BeExactly $script:originalScene
        }

        It 'restores global.ini byte for byte on uninstall' {
            Invoke-Fixture -Fixture $script:fixture -Mode Uninstall | Should -Be ([ConfigureObsResult]::Success)

            $global = (Read-TextFile -Path (Join-Path $script:fixture.Config 'global.ini')).Text

            $global.Replace('ServerEnabled=true', 'ServerEnabled=false').Replace("ExtraBrowserDocks=[]`n", '') | Should -BeExactly $script:originalGlobal
            Get-BridgePaths -Path (Join-Path $script:fixture.Config 'basic\scenes\Untitled.json') | Should -BeNullOrEmpty
        }
    }

    Context 'OBS 30: obs-websocket config.json, docks in global.ini' {
        BeforeAll {
            $script:fixture = New-ObsFixture -Name 'obs-30'
            $script:before = @{}

            Get-ChildItem -LiteralPath $script:fixture.Config -Recurse -File | ForEach-Object { $script:before[$_.FullName] = (Read-TextFile -Path $_.FullName).Text }
        }

        It 'installs' {
            Invoke-Fixture -Fixture $script:fixture | Should -Be ([ConfigureObsResult]::Success)
        }

        It 'keeps the existing dock and appends ours' {
            $docks = @(Get-Docks -Path (Join-Path $script:fixture.Config 'global.ini'))

            $docks.Count | Should -Be 2
            $docks[0].title | Should -Be 'Chat'
            $docks[1].title | Should -Be 'StreamoScope'
            $docks[1].uuid | Should -Match '^[0-9a-f]{32}$'
        }

        It 'changes only server_enabled in config.json' {
            $path = Join-Path $script:fixture.Config 'plugin_config\obs-websocket\config.json'

            (Read-TextFile -Path $path).Text | Should -BeExactly $script:before[$path].Replace('"server_enabled": false', '"server_enabled": true')
        }

        It 'fills the empty scripts-tool and leaves backups alone' {
            $scene = Join-Path $script:fixture.Config 'basic\scenes\Main.json'
            $backup = Join-Path $script:fixture.Config 'basic\scenes\Main.json.bak'

            Get-BridgePaths -Path $scene | Should -Be @($script:fixture.BridgePath)
            (Read-TextFile -Path $backup).Text | Should -BeExactly $script:before[$backup]
        }

        It 'changes nothing on a second install' {
            $hashes = Get-Hashes -Directory $script:fixture.Config

            Invoke-Fixture -Fixture $script:fixture | Should -Be ([ConfigureObsResult]::Success)
            Get-Hashes -Directory $script:fixture.Config | Should -BeExactly $hashes
        }

        It 'returns ini and collections to the original on uninstall' {
            Invoke-Fixture -Fixture $script:fixture -Mode Uninstall | Should -Be ([ConfigureObsResult]::Success)

            (Read-TextFile -Path (Join-Path $script:fixture.Config 'global.ini')).Text | Should -BeExactly $script:before[(Join-Path $script:fixture.Config 'global.ini')]
            (Read-TextFile -Path (Join-Path $script:fixture.Config 'basic\scenes\Main.json')).Text | Should -BeExactly $script:before[(Join-Path $script:fixture.Config 'basic\scenes\Main.json')]
            Test-Path -LiteralPath (Join-Path $script:fixture.Install 'install-manifest.json') | Should -BeFalse
        }

        It 'removes the bridge data from the profile and keeps the rest byte for byte' {
            $profilePath = Join-Path $script:fixture.Config 'basic\profiles\Untitled\basic.ini'
            $bridgeSection = "[StreamoScope]`r`nPluginOutputs={`"bridgeVersion`":5,`"updated`":1760000000,`"outputs`":[]}`r`n`r`n"
            $profileFile = Read-TextFile -Path $profilePath

            $profileFile.Text | Should -BeExactly $script:before[$profilePath].Replace($bridgeSection, '')
            $profileFile.HasBom | Should -BeTrue
        }
    }

    Context 'OBS 33: user.ini, [Locations], several collections and profiles' {
        BeforeAll {
            $script:fixture = New-ObsFixture -Name 'obs-33'
            Copy-Item -LiteralPath (Join-Path $script:fixture.Config 'basic\scenes\Stream.json') -Destination (Join-Path $script:fixture.Config "basic\scenes\$script:cyrillicCollection")
            $script:globalHash = (Get-FileHash -LiteralPath (Join-Path $script:fixture.Config 'global.ini')).Hash
            $script:userIni = (Read-TextFile -Path (Join-Path $script:fixture.Config 'user.ini')).Text
            $script:streamCanonical = ConvertTo-Canonical -Path (Join-Path $script:fixture.Config 'basic\scenes\Stream.json')
            $script:streamProfilePath = Join-Path $script:fixture.Config 'basic\profiles\Stream\basic.ini'
            $script:streamProfile = (Read-TextFile -Path $script:streamProfilePath).Text
            $script:recordingProfilePath = Join-Path $script:fixture.Config 'basic\profiles\Recording\basic.ini'
            $script:recordingProfileHash = (Get-FileHash -LiteralPath $script:recordingProfilePath).Hash
        }

        It 'installs' {
            Invoke-Fixture -Fixture $script:fixture | Should -Be ([ConfigureObsResult]::Success)
        }

        It 'leaves profiles alone on install' {
            (Read-TextFile -Path $script:streamProfilePath).Text | Should -BeExactly $script:streamProfile
            (Get-FileHash -LiteralPath $script:recordingProfilePath).Hash | Should -Be $script:recordingProfileHash
        }

        It 'writes the dock to user.ini under a free title and leaves global.ini alone' {
            $docks = @(Get-Docks -Path (Join-Path $script:fixture.Config 'user.ini'))

            $docks.Count | Should -Be 3
            $docks[2].title | Should -Be 'StreamoScope (2)'
            $docks[2].url | Should -Be $script:fixture.DockUrl
            (Get-FileHash -LiteralPath (Join-Path $script:fixture.Config 'global.ini')).Hash | Should -Be $script:globalHash
        }

        It 'adds the bridge to every collection, Cyrillic names included' {
            Get-BridgePaths -Path (Join-Path $script:fixture.Config 'basic\scenes\Stream.json') | Should -Be @('C:/Program Files/obs-studio/data/obs-plugins/frontend-tools/scripts/clock-source.lua', $script:fixture.BridgePath)
            Get-BridgePaths -Path (Join-Path $script:fixture.Config "basic\scenes\$script:cyrillicCollection") | Should -Contain $script:fixture.BridgePath
        }

        It 'records what it added in the manifest' {
            $manifest = Get-Content -LiteralPath (Join-Path $script:fixture.Install 'install-manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json

            @($manifest.collections).Count | Should -Be 2
            $manifest.dockUrl | Should -Be $script:fixture.DockUrl
            $manifest.webSocket | Should -Be 'enabled'
        }

        It 'removes only its own dock and script on uninstall' {
            Invoke-Fixture -Fixture $script:fixture -Mode Uninstall | Should -Be ([ConfigureObsResult]::Success)

            (Read-TextFile -Path (Join-Path $script:fixture.Config 'user.ini')).Text | Should -BeExactly $script:userIni
            ConvertTo-Canonical -Path (Join-Path $script:fixture.Config 'basic\scenes\Stream.json') | Should -BeExactly $script:streamCanonical
        }

        It 'removes the current and the old bridge sections from every profile and nothing else' {
            $bridgeSectionsStart = $script:streamProfile.IndexOf("`n[ObsStatsDock]")

            (Read-TextFile -Path $script:streamProfilePath).Text | Should -BeExactly $script:streamProfile.Substring(0, $bridgeSectionsStart)
            (Get-FileHash -LiteralPath $script:recordingProfilePath).Hash | Should -Be $script:recordingProfileHash
        }
    }

    Context 'check before uninstall' {
        It 'reports a running OBS' {
            Mock Test-ObsRunning { $true }
            $fixture = New-ObsFixture -Name 'obs-33'

            Invoke-Fixture -Fixture $fixture -Mode Check | Should -Be ([ConfigureObsResult]::ObsRunning)
        }

        It 'changes nothing when OBS is closed' {
            $fixture = New-ObsFixture -Name 'obs-33'
            $hashes = Get-Hashes -Directory $fixture.Config

            Invoke-Fixture -Fixture $fixture -Mode Check | Should -Be ([ConfigureObsResult]::Success)
            Get-Hashes -Directory $fixture.Config | Should -BeExactly $hashes
            Test-Path -LiteralPath (Join-Path $fixture.Install 'install-manifest.json') | Should -BeFalse
        }
    }

    Context 'when something is wrong' {
        It 'does nothing while OBS is running' {
            Mock Test-ObsRunning { $true }
            $fixture = New-ObsFixture -Name 'obs-30'
            $hashes = Get-Hashes -Directory $fixture.Config

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::ObsRunning)
            Get-Hashes -Directory $fixture.Config | Should -BeExactly $hashes
        }

        It 'asks to start OBS once when there is no config yet' {
            $fixture = New-ObsFixture -Name $null

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::ObsConfigNotFound)
            @(Get-ChildItem -LiteralPath $fixture.Config -Recurse -File).Count | Should -Be 0
        }

        It 'changes nothing when a collection is broken' {
            $fixture = New-ObsFixture -Name 'obs-33'
            Set-Content -LiteralPath (Join-Path $fixture.Config 'basic\scenes\Broken.json') -Value '{"modules": {"scripts-tool": [' -NoNewline
            $hashes = Get-Hashes -Directory $fixture.Config

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::UnsupportedFormat)
            Get-Hashes -Directory $fixture.Config | Should -BeExactly $hashes
        }

        It 'restores every file when a write fails halfway' {
            $fixture = New-ObsFixture -Name 'obs-30'
            $hashes = Get-Hashes -Directory $fixture.Config
            $script:writeCalls = 0

            Mock Write-TextFile {
                $script:writeCalls += 1

                if ($script:writeCalls -ge 2) {
                    throw 'disk full'
                }

                [System.IO.File]::WriteAllText($Path, 'corrupted')
            }

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::Failed)
            Get-Hashes -Directory $fixture.Config | Should -BeExactly $hashes
        }

        It 'reports a missing obs-websocket config' {
            $fixture = New-ObsFixture -Name 'obs-33'
            Remove-Item -LiteralPath (Join-Path $fixture.Config 'plugin_config') -Recurse

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::SuccessWithoutWebSocket)
            Test-Path -LiteralPath (Join-Path $fixture.Config 'plugin_config') | Should -BeFalse
        }
    }

    Context 'portable OBS' {
        It 'finds the config inside the OBS folder' {
            $fixture = New-ObsFixture -Name 'obs-30'
            $obsDirectory = Join-Path $fixture.Root 'obs-portable'

            New-Item -ItemType Directory -Path (Join-Path $obsDirectory 'config') -Force | Out-Null
            Move-Item -LiteralPath $fixture.Config -Destination (Join-Path $obsDirectory 'config\obs-studio')
            Set-Content -LiteralPath (Join-Path $obsDirectory 'portable_mode.txt') -Value ''

            Test-PortableObs -ObsDirectory $obsDirectory | Should -BeTrue
            Invoke-ConfigureObs -Mode Install -InstallDirectory $fixture.Install -ObsDirectory $obsDirectory -DataDirectory $fixture.Data | Should -Be ([ConfigureObsResult]::Success)
            @(Get-Docks -Path (Join-Path $obsDirectory 'config\obs-studio\global.ini')).Count | Should -Be 2
        }
    }
}
