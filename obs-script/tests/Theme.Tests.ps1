BeforeAll {
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'helpers') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }

    Import-LuaLibrary

    $script:OriginalLocalAppData = $env:LOCALAPPDATA
    $script:WorkDirectory = Join-Path $TestDrive $script:UserDirectoryName
}

AfterAll {
    $env:LOCALAPPDATA = $script:OriginalLocalAppData
}

Describe 'Colors of the OBS theme passed by the bridge' {
    BeforeAll {
        $installRoot = Join-Path $script:WorkDirectory 'theme-app'
        $dataDirectory = Join-Path $script:WorkDirectory 'theme-data'

        New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null
        Copy-BridgeFiles -TargetDirectory $installRoot

        $env:LOCALAPPDATA = $dataDirectory

        $result = Invoke-LuaSource -Source (Get-BridgeSource -InstallRoot $installRoot -ScenarioFileName 'theme.lua')

        $result.IsFailed | Should -BeFalse -Because $result.Text

        $script:Results = ConvertTo-BridgeResults -Text $result.Text
        $script:DefaultColors = 'base:#0a141e,border:#445566,input:#222222,primary:#abcdef,text:#ffffff,window:#112233'
    }

    It 'composes the variant from the user folder over its base from the OBS folder' {
        $script:Results.variantId | Should -Be 'test.Base.Variant'
        $script:Results.variantColors | Should -Be 'base:#0a141e,border:#445566,input:#222222,primary:#abcdef,text:#ffffff,window:#c8c9ca'
    }

    It 'passes the OBS font size and follows its change without reading the theme files again' {
        $script:Results.variantFontScale | Should -Be '12'
        $script:Results.fontScaleSameTable | Should -Be 'true'
        $script:Results.fontScaleAfterChange | Should -Be '9'
        $script:Results.dockFileFontScale | Should -Be '9'
        $script:Results.oldFontScale | Should -Be 'nil'
    }

    It 'takes darkness from the theme when OBS cannot tell it' {
        $script:Results.variantIsDark | Should -Be 'false'
        $script:Results.missingIsDark | Should -Be 'true'
    }

    It 'reads the files again only when the theme changes' {
        $script:Results.cached | Should -Be 'true'
        $script:Results.cachedColors | Should -Be $script:Results.variantColors
    }

    It 'falls back to the default theme like OBS when the theme is missing or broken' {
        $script:Results.missingId | Should -Be 'test.Missing'
        $script:Results.missingColors | Should -Be $script:DefaultColors
        $script:Results.loopColors | Should -Be $script:DefaultColors
        $script:Results.withoutSettingId | Should -Be 'com.obsproject.Yami.Original'
    }

    It 'finds user themes next to the profiles in OBS 30 and asks OBS whether the theme is dark' {
        $script:Results.oldIsDark | Should -Be 'true'
        $script:Results.oldColors | Should -Be 'base:#0a141e,border:#445566,input:#222222,primary:#abcdef,text:#ffffff,window:#010203'
        $script:Results.freedProfilePaths | Should -Be '1'
    }

    It 'finds user themes of a portable OBS by a path relative to obs64.exe' {
        $script:Results.portableWindow | Should -Be '#0f0e0d'
    }

    It 'passes only darkness when there are no theme files, as in OBS 28 and 29' {
        $script:Results.legacyId | Should -Be 'com.obsproject.Yami.Original'
        $script:Results.legacyIsDark | Should -Be 'false'
        $script:Results.legacyColors | Should -Be 'nil'
    }

    It 'writes the theme next to the dock page for the dock to read before it connects' {
        $script:Results.dockFileGlobal | Should -Be 'true'
        $script:Results.dockFileWindow | Should -Be '#c8c9ca'
        $script:Results.dockFileAfterChange | Should -Be '#112233'
    }

    It 'writes no theme file where there is no dock page' {
        $script:Results.dockFileWithoutPage | Should -Be 'test.Loop'
    }

    It 'publishes the theme with the rest of the bridge data' {
        $script:Results.publishedTheme | Should -Be 'true'
        $script:Results.publishedWindow | Should -Be '#112233'
        $script:Results.publishedId | Should -Be 'test.Base'
    }

    It 'passes nothing after it is closed or without the OBS libraries' {
        $script:Results.afterClose | Should -Be 'nil'
        $script:Results.withoutLibraries | Should -Be 'nil'
    }
}
