BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers\configure') -Filter '*.ps1' | ForEach-Object { . $_.FullName }
    . (Join-Path $PSScriptRoot 'helpers\updater\run\Invoke-TestEntry.ps1')

    $script:fixtures = Join-Path $PSScriptRoot 'fixtures'
    $script:cyrillicFolder = -join [char[]](0x041F, 0x0440, 0x043E, 0x0433, 0x0440, 0x0430, 0x043C, 0x043C, 0x044B)
    $script:cyrillicCollection = (-join [char[]](0x041C, 0x043E, 0x0438, 0x0020, 0x0441, 0x0446, 0x0435, 0x043D, 0x044B)) + '.json'
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

        It 'reports an unsupported format and changes nothing when global.ini is not UTF-8' {
            $fixture = New-ObsFixture -Name 'obs-30'
            [System.IO.File]::WriteAllBytes((Join-Path $fixture.Config 'global.ini'), [byte[]](0x5B, 0xFF, 0x5D))
            $hashes = Get-Hashes -Directory $fixture.Config

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::UnsupportedFormat)
            Get-Hashes -Directory $fixture.Config | Should -BeExactly $hashes
        }

        It 'removes the dock on uninstall even when one profile cannot be read' {
            $fixture = New-ObsFixture -Name 'obs-33'

            Invoke-Fixture -Fixture $fixture | Should -Be ([ConfigureObsResult]::Success)

            $brokenProfilePath = Join-Path $fixture.Config 'basic\profiles\Recording\basic.ini'
            [System.IO.File]::WriteAllBytes($brokenProfilePath, [byte[]](0x5B, 0x47, 0xFF, 0x5D))
            $brokenProfileHash = (Get-FileHash -LiteralPath $brokenProfilePath).Hash

            Invoke-Fixture -Fixture $fixture -Mode Uninstall | Should -Be ([ConfigureObsResult]::Success)
            (Get-FileHash -LiteralPath $brokenProfilePath).Hash | Should -Be $brokenProfileHash
            @(Get-Docks -Path (Join-Path $fixture.Config 'user.ini') | Where-Object { $_.url -eq $fixture.DockUrl }).Count | Should -Be 0
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

Describe 'removing program data' {
    It 'removes the journal and the updater state even while OBS is running, and keeps the backups and the log' {
        Mock Test-ObsRunning { $true }
        $fixture = New-ObsFixture -Name 'obs-33'
        New-ProgramData -DataDirectory $fixture.Data

        Invoke-Fixture -Fixture $fixture -Mode RemoveData | Should -Be ([ConfigureObsResult]::Success)
        (Get-ChildItem -LiteralPath $fixture.Data -Name | Sort-Object) -join ',' | Should -Be 'backups,configure-obs.log'
        Test-Path -LiteralPath (Join-Path $fixture.Data 'backups\2026-01-01_00-00-00\global.ini') | Should -BeTrue
    }

    It 'removes the rest and reports a file it could not remove' {
        $fixture = New-ObsFixture -Name 'obs-33'
        New-ProgramData -DataDirectory $fixture.Data
        $lockedJournal = [System.IO.File]::Open((Join-Path $fixture.Data 'journal.txt'), 'Open', 'Read', 'None')

        try {
            Invoke-Fixture -Fixture $fixture -Mode RemoveData | Should -Be ([ConfigureObsResult]::Failed)
        } finally {
            $lockedJournal.Dispose()
        }

        (Get-ChildItem -LiteralPath $fixture.Data -Name | Sort-Object) -join ',' | Should -Be 'backups,configure-obs.log,journal.txt'
        Get-Content -LiteralPath (Join-Path $fixture.Data 'configure-obs.log') -Raw | Should -Match 'Could not remove: journal\.txt'
    }

    It 'succeeds when there is nothing to remove' {
        $fixture = New-ObsFixture -Name 'obs-33'

        Invoke-Fixture -Fixture $fixture -Mode RemoveData | Should -Be ([ConfigureObsResult]::Success)
    }
}

Describe 'configure-obs.ps1 in a version folder' {
    BeforeDiscovery {
        $isObsRunning = $null -ne (Get-Process -Name 'obs64', 'obs32' -ErrorAction SilentlyContinue | Select-Object -First 1)
    }

    BeforeEach {
        $script:fixture = New-ObsFixture -Name 'obs-33'
        $script:versionDirectory = Join-Path $script:fixture.Install 'versions\0.7.0'
        $script:entry = Join-Path $script:versionDirectory 'configure-obs.ps1'

        New-Item -ItemType Directory -Path $script:versionDirectory -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot '..\configure-obs.ps1') -Destination $script:entry
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot '..\ConfigureObs') -Destination $script:versionDirectory -Recurse
    }

    It 'sets up and removes OBS for the install folder it is given, with its own functions' -Skip:$isObsRunning {
        $arguments = @('-InstallDirectory', "`"$($script:fixture.Install)`"", '-ConfigDirectory', "`"$($script:fixture.Config)`"", '-DataDirectory', "`"$($script:fixture.Data)`"")
        $manifestPath = Join-Path $script:fixture.Install 'install-manifest.json'

        Invoke-TestEntry -EntryPath $script:entry -EntryArguments (@('-Mode', 'Install') + $arguments) | Should -Be ([int][ConfigureObsResult]::Success)
        Test-Path -LiteralPath $manifestPath | Should -BeTrue
        Test-Path -LiteralPath (Join-Path $script:versionDirectory 'install-manifest.json') | Should -BeFalse
        @(Get-Docks -Path (Join-Path $script:fixture.Config 'user.ini') | Where-Object { $_.url -eq $script:fixture.DockUrl }).Count | Should -Be 1

        Invoke-TestEntry -EntryPath $script:entry -EntryArguments (@('-Mode', 'Uninstall') + $arguments) | Should -Be ([int][ConfigureObsResult]::Success)
        Test-Path -LiteralPath $manifestPath | Should -BeFalse
        @(Get-Docks -Path (Join-Path $script:fixture.Config 'user.ini') | Where-Object { $_.url -eq $script:fixture.DockUrl }).Count | Should -Be 0
    }

    It 'removes the program data' {
        New-ProgramData -DataDirectory $script:fixture.Data

        Invoke-TestEntry -EntryPath $script:entry -EntryArguments @('-Mode', 'RemoveData', '-InstallDirectory', "`"$($script:fixture.Install)`"", '-DataDirectory', "`"$($script:fixture.Data)`"") | Should -Be ([int][ConfigureObsResult]::Success)
        (Get-ChildItem -LiteralPath $script:fixture.Data -Name | Sort-Object) -join ',' | Should -Be 'backups,configure-obs.log'
    }
}
