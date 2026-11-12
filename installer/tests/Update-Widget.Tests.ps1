BeforeAll {
    $updaterDirectory = Join-Path $PSScriptRoot '..\updater'

    Get-ChildItem -LiteralPath (Join-Path $updaterDirectory 'UpdateWidget') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }
    . (Join-Path $PSScriptRoot '..\ConfigureObs\paths\Find-ObsDirectory.ps1')
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers\updater') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $script:minisign = $env:STREAMOSCOPE_MINISIGN

    if ([string]::IsNullOrEmpty($script:minisign) -or -not (Test-Path -LiteralPath $script:minisign)) {
        throw 'Run the tests with npm run test:installer: minisign.exe is needed'
    }

    $script:releaseKey = New-TestKey -Name 'release'
    $script:otherKey = New-TestKey -Name 'other'
}

Describe 'Compare-SemanticVersion' {
    It 'compares <First> and <Second> as <Expected>' -TestCases @(
        @{First = '0.2.0'; Second = '0.1.9'; Expected = 1},
        @{First = '0.10.0'; Second = '0.9.0'; Expected = 1},
        @{First = '1.0.0'; Second = '1.0.0'; Expected = 0},
        @{First = '1.2.3'; Second = '1.10.0'; Expected = -1}
    ) {
        param($First, $Second, $Expected)

        Compare-SemanticVersion -First $First -Second $Second | Should -Be $Expected
    }

    It 'rejects anything but X.Y.Z' {
        { Compare-SemanticVersion -First '1.2' -Second '1.2.0' } | Should -Throw
        { Compare-SemanticVersion -First '1.2.0-beta' -Second '1.2.0' } | Should -Throw
    }
}

Describe 'Invoke-UpdateWidget' {
    BeforeEach {
        Mock Get-ObsVersion { '33.0.1' }
        Mock Get-ObsProcessId { 123 }
        Mock Set-UninstallDisplayVersion { }
    }

    It 'unpacks a newer signed release next to the old one and switches to it' {
        $release = New-TestRelease

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        (Get-TestStatus -Release $release).stage | Should -Be 'done'
        (Get-TestStatus -Release $release).version | Should -Be '0.2.0'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.2.0'
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\0.2.0\streamoscope-bridge\main.lua') | Should -BeTrue
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\0.1.0') | Should -BeTrue
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\staging-0.2.0') | Should -BeFalse
        Should -Invoke Set-UninstallDisplayVersion -Times 1 -ParameterFilter { $Version -eq '0.2.0' }
        Get-Content -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -Be @('version=0.2.0', 'previous=0.1.0', 'panel=0', 'process=123', 'launches=0')
        Test-Path -LiteralPath (Join-Path ([System.IO.Path]::GetTempPath()) 'streamoscope-update-0.2.0') | Should -BeFalse
    }

    It 'reports every stage and the download progress' {
        $release = New-TestRelease
        $script:stages = @()

        Mock Write-UpdateStatus { $script:stages += "$Stage $Percent" }

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        $downloads = @($script:stages | Where-Object { $_ -like 'downloading *' } | ForEach-Object { [int]$_.Split(' ')[1] })

        $script:stages[0] | Should -Be 'preparing 0'
        $downloads.Count | Should -BeGreaterThan 3
        ($downloads | Sort-Object) -join ',' | Should -Be ($downloads -join ',')
        $downloads[-1] | Should -Be 100
        $script:stages[-2] | Should -Be 'installing 100'
        $script:stages[-1] | Should -Be 'done 100'
    }

    It 'refuses <Version> as <Expected>' -TestCases @(
        @{Version = '0.0.9'; Expected = 'notNewer'},
        @{Version = '0.2'; Expected = 'invalidVersion'},
        @{Version = '0.2.0; calc'; Expected = 'invalidVersion'}
    ) {
        param($Version, $Expected)

        $release = New-TestRelease

        Invoke-TestUpdate -Release $release -Version $Version | Should -Be $Expected
        (Get-TestStatus -Release $release).error | Should -Be $Expected
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
    }

    It 'checks the panel of the new version only if the panel of the old one reported health in this launch of OBS' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-version.txt') -Value '0.1.0'
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-process.txt') -Value '123'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        Get-Content -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -Contain 'panel=1'
    }

    It 'does not check the panel when it reported in an earlier launch of OBS' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-version.txt') -Value '0.1.0'
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-process.txt') -Value '456'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        Get-Content -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -Contain 'panel=0'
    }

    It 'does not check the panel when no launch of OBS is recorded' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-version.txt') -Value '0.1.0'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        Get-Content -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -Contain 'panel=0'
    }

    It 'does not check the panel when the health report is about another version' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-version.txt') -Value '0.0.9'
        Set-Content -LiteralPath (Join-Path $release.Install 'healthy-process.txt') -Value '123'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        Get-Content -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -Contain 'panel=0'
    }

    It 'lets a person install a rolled back version again and forgets the rollback' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'rolled-back-version.txt') -Value '0.2.0'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        Test-Path -LiteralPath (Join-Path $release.Install 'rolled-back-version.txt') | Should -BeFalse
    }

    It 'leaves no trial when the package is incomplete' {
        $release = New-TestRelease -WithoutBridge

        Invoke-TestUpdate -Release $release | Should -Be 'install'
        Test-Path -LiteralPath (Join-Path $release.Install 'update-trial.txt') | Should -BeFalse
    }

    It 'counts the version that is already switched to as done' {
        $release = New-TestRelease -InstalledVersion '0.2.0'

        Invoke-TestUpdate -Release $release | Should -Be 'done'
        (Get-TestStatus -Release $release).stage | Should -Be 'done'
        Should -Invoke Set-UninstallDisplayVersion -Times 0
    }

    It 'reports a network error when the release is missing' {
        $release = New-TestRelease -SkipPackage

        Invoke-TestUpdate -Release $release | Should -Be 'network'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
    }

    It 'never unpacks a package that was changed after signing' {
        $release = New-TestRelease -TamperPackage

        Invoke-TestUpdate -Release $release | Should -Be 'signature'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\0.2.0') | Should -BeFalse
    }

    It 'never unpacks a release signed with another key' {
        $release = New-TestRelease -Key $script:otherKey

        Invoke-TestUpdate -Release $release | Should -Be 'signature'
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\0.2.0') | Should -BeFalse
    }

    It 'rejects compatibility data of another version' {
        $release = New-TestRelease -CompatibilityVersion '0.3.0'

        Invoke-TestUpdate -Release $release | Should -Be 'signature'
    }

    It 'stops when OBS is older than the release needs' {
        Mock Get-ObsVersion { '27.2.4' }
        $release = New-TestRelease -MinObsVersion '28.0.0'

        Invoke-TestUpdate -Release $release | Should -Be 'incompatible'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
    }

    It 'goes on when the OBS version is unknown' {
        Mock Get-ObsVersion { $null }

        Invoke-TestUpdate -Release (New-TestRelease) | Should -Be 'done'
    }

    It 'keeps the current version when the package is incomplete' {
        $release = New-TestRelease -WithoutBridge

        Invoke-TestUpdate -Release $release | Should -Be 'install'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\0.2.0') | Should -BeFalse
        Test-Path -LiteralPath (Join-Path $release.Install 'versions\staging-0.2.0') | Should -BeFalse
    }

    It 'does not start a second update while one is running' {
        $release = New-TestRelease
        New-Item -ItemType Directory -Path (Split-Path -Parent $release.Status) -Force | Out-Null
        Set-Content -LiteralPath $release.Status -Value '{"stage": "downloading"}'
        $lock = [System.IO.File]::Open("$($release.Status).lock", 'OpenOrCreate', 'ReadWrite', 'None')

        try {
            Invoke-TestUpdate -Release $release | Should -Be 'busy'
            (Get-TestStatus -Release $release).stage | Should -Be 'downloading'
        } finally {
            $lock.Dispose()
        }
    }
}

Describe 'Get-AutoUpdateAction' {
    It 'answers <Expected> for <Version> over <Installed>, published <AgeHours> hours ago, rolled back <RolledBack>' -TestCases @(
        @{Version = '0.2.0'; Installed = '0.1.0'; AgeHours = 49; RolledBack = $null; Expected = 'install'},
        @{Version = '0.2.0'; Installed = '0.1.0'; AgeHours = 47; RolledBack = $null; Expected = 'tooFresh'},
        @{Version = '0.2.0'; Installed = '0.2.0'; AgeHours = 49; RolledBack = $null; Expected = 'upToDate'},
        @{Version = '0.1.0'; Installed = '0.2.0'; AgeHours = 49; RolledBack = $null; Expected = 'upToDate'},
        @{Version = '1.0.0'; Installed = '0.9.0'; AgeHours = 49; RolledBack = $null; Expected = 'manualOnly'},
        @{Version = '0.2.0'; Installed = '0.1.0'; AgeHours = 49; RolledBack = '0.2.0'; Expected = 'rolledBack'},
        @{Version = '0.2.0'; Installed = '0.1.0'; AgeHours = 49; RolledBack = '0.3.0'; Expected = 'rolledBack'},
        @{Version = '0.2.1'; Installed = '0.1.0'; AgeHours = 49; RolledBack = '0.2.0'; Expected = 'install'}
    ) {
        param($Version, $Installed, $AgeHours, $RolledBack, $Expected)

        $now = [DateTimeOffset]::UtcNow
        $release = [pscustomobject]@{Version = $Version; PublishedAt = $now.AddHours(-$AgeHours)}

        Get-AutoUpdateAction -Release $release -InstalledVersion $Installed -RolledBackVersion $RolledBack -Now $now | Should -Be $Expected
    }
}

Describe 'Invoke-AutoUpdate' {
    BeforeEach {
        Mock Get-ObsVersion { '33.0.1' }
        Mock Set-UninstallDisplayVersion { }
    }

    It 'installs a release that has been out long enough' {
        $release = New-TestRelease

        Invoke-TestAutoUpdate -Release $release | Should -Be 'done'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.2.0'
    }

    It 'puts the running version back into Windows Apps after a rollback' {
        $release = New-TestRelease -InstalledVersion '0.2.0'

        Invoke-TestAutoUpdate -Release $release | Should -Be 'upToDate'
        Should -Invoke Set-UninstallDisplayVersion -Times 1 -ParameterFilter { $Version -eq '0.2.0' }
    }

    It 'does not install a rolled back version by itself' {
        $release = New-TestRelease
        Set-Content -LiteralPath (Join-Path $release.Install 'rolled-back-version.txt') -Value '0.2.0'

        Invoke-TestAutoUpdate -Release $release | Should -Be 'rolledBack'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
    }

    It 'waits with a fresh release and leaves no status' {
        $release = New-TestRelease -PublishedAt ([DateTimeOffset]::UtcNow.AddHours(-1))

        Invoke-TestAutoUpdate -Release $release | Should -Be 'tooFresh'
        Get-InstalledVersion -InstallDirectory $release.Install | Should -Be '0.1.0'
        Test-Path -LiteralPath $release.Status | Should -BeFalse
    }

    It 'does not ask GitHub again within the hour' {
        $release = New-TestRelease -InstalledVersion '0.2.0'

        Invoke-TestAutoUpdate -Release $release | Should -Be 'upToDate'
        Invoke-TestAutoUpdate -Release $release | Should -Be 'notDue'
    }

    It 'asks again after the hour' {
        $release = New-TestRelease -InstalledVersion '0.2.0'

        Invoke-TestAutoUpdate -Release $release | Should -Be 'upToDate'
        (Get-Item -LiteralPath (Join-Path (Split-Path -Parent $release.Status) 'update-check.stamp')).LastWriteTimeUtc = [DateTime]::UtcNow.AddHours(-2)
        Invoke-TestAutoUpdate -Release $release | Should -Be 'upToDate'
    }

    It 'does not count a failed request as a check' {
        $release = New-TestRelease
        $release.LatestUrl = [System.Uri]::new((Join-Path $TestDrive 'missing.json')).AbsoluteUri

        { Invoke-TestAutoUpdate -Release $release } | Should -Throw
        Test-Path -LiteralPath (Join-Path (Split-Path -Parent $release.Status) 'update-check.stamp') | Should -BeFalse
    }
}

Describe 'Remove-OldVersions' {
    It 'keeps the three newest versions and nothing else is touched' {
        $versions = Join-Path $TestDrive 'old-versions'

        foreach ($name in @('0.9.0', '0.10.0', '0.10.1', '0.11.0', '1.0.0', 'keep-me')) {
            New-Item -ItemType Directory -Path (Join-Path $versions $name) -Force | Out-Null
        }

        Remove-OldVersions -VersionsDirectory $versions -ProtectedVersions @('1.0.0')

        (Get-ChildItem -LiteralPath $versions -Directory).Name | Sort-Object | Should -Be @('0.10.1', '0.11.0', '1.0.0', 'keep-me')
    }

    It 'keeps the version to roll back to, however old it is' {
        $versions = Join-Path $TestDrive 'protected-versions'

        foreach ($name in @('0.5.0', '0.6.0', '0.6.1', '0.6.2', '0.6.3')) {
            New-Item -ItemType Directory -Path (Join-Path $versions $name) -Force | Out-Null
        }

        Remove-OldVersions -VersionsDirectory $versions -ProtectedVersions @('0.6.3', '0.5.0')

        (Get-ChildItem -LiteralPath $versions -Directory).Name | Sort-Object | Should -Be @('0.5.0', '0.6.1', '0.6.2', '0.6.3')
    }
}

Describe 'Set-CurrentVersion' {
    It 'replaces the version and leaves no temporary file' {
        $install = Join-Path $TestDrive 'switch'
        New-Item -ItemType Directory -Path $install -Force | Out-Null
        Set-Content -LiteralPath (Join-Path $install 'current-version.js') -Value "window.STREAMOSCOPE_VERSION = '0.1.0';"

        Set-CurrentVersion -InstallDirectory $install -Version '0.2.0'

        Get-InstalledVersion -InstallDirectory $install | Should -Be '0.2.0'
        (Get-ChildItem -LiteralPath $install).Name | Should -Be 'current-version.js'
    }
}

Describe 'Set-UninstallDisplayVersion' {
    It 'writes to the uninstall entry the installer creates' {
        $appId = [regex]::Match((Get-Content -LiteralPath (Join-Path $PSScriptRoot '..\streamoscope.iss') -Raw), 'AppId=\{\{([0-9A-F-]+)\}').Groups[1].Value

        $script:UninstallRegistryKey | Should -BeLike "*\{$appId}_is1"
    }
}

Describe 'Update-Widget.ps1' {
    BeforeAll {
        $entry = Join-Path $updaterDirectory 'Update-Widget.ps1'
        $installerDirectory = Join-Path $PSScriptRoot '..'
    }

    It 'checks updates with the public key from minisign.pub' {
        $script = Get-Content -LiteralPath $entry -Raw
        $publicKey = (Get-Content -LiteralPath (Join-Path $PSScriptRoot '..\..\minisign.pub'))[1]

        $script | Should -Match ([regex]::Escape("[string]`$PublicKey = '$publicKey'"))
    }

    It 'exits with 1 and writes a failed status for a bad version' {
        $status = Join-Path $TestDrive 'entry\update-status.json'

        Invoke-TestEntry -EntryPath $entry -EntryArguments @('-Version', 'bad', '-InstallDirectory', "`"$installerDirectory`"", '-StatusPath', "`"$status`"") | Should -Be 1
        (Get-Content -LiteralPath $status -Raw | ConvertFrom-Json).error | Should -Be 'invalidVersion'
    }

    It 'exits with 1 and writes nothing when the background check fails' {
        $status = Join-Path $TestDrive 'entry-auto\update-status.json'
        $missing = [System.Uri]::new((Join-Path $TestDrive 'missing.json')).AbsoluteUri

        Invoke-TestEntry -EntryPath $entry -EntryArguments @('-Auto', '-InstallDirectory', "`"$installerDirectory`"", '-StatusPath', "`"$status`"", '-LatestReleaseUrl', $missing) | Should -Be 1
        Test-Path -LiteralPath $status | Should -BeFalse
    }

    It 'exits with 0 when the background check is not due yet' {
        $status = Join-Path $TestDrive 'entry-due\update-status.json'
        New-Item -ItemType Directory -Path (Split-Path -Parent $status) -Force | Out-Null
        Set-Content -LiteralPath (Join-Path (Split-Path -Parent $status) 'update-check.stamp') -Value ''

        Invoke-TestEntry -EntryPath $entry -EntryArguments @('-Auto', '-InstallDirectory', "`"$installerDirectory`"", '-StatusPath', "`"$status`"") | Should -Be 0
    }

    It 'finds OBS with the functions in the install folder when its version has none' {
        $install = Join-Path $TestDrive 'entry-fallback'
        $versionEntry = Join-Path $install 'versions\0.6.0\updater\Update-Widget.ps1'
        $status = Join-Path $install 'data\update-status.json'
        New-Item -ItemType Directory -Path (Join-Path $install 'versions\0.6.0'), (Split-Path -Parent $status) -Force | Out-Null
        Copy-Item -LiteralPath $updaterDirectory -Destination (Join-Path $install 'versions\0.6.0\updater') -Recurse
        Set-Content -LiteralPath (Join-Path (Split-Path -Parent $status) 'update-check.stamp') -Value ''

        Invoke-TestEntry -EntryPath $versionEntry -EntryArguments @('-Auto', '-StatusPath', "`"$status`"") | Should -Be 1

        Copy-Item -LiteralPath (Join-Path $installerDirectory 'ConfigureObs') -Destination $install -Recurse

        Invoke-TestEntry -EntryPath $versionEntry -EntryArguments @('-Auto', '-StatusPath', "`"$status`"") | Should -Be 0
    }
}
