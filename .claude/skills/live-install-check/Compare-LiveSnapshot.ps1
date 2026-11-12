param(
    [Parameter(Mandatory)][string]$SnapshotDirectory,
    [Parameter(Mandatory)][ValidateSet('Installed', 'Unchanged', 'Removed')][string]$Expect
)

$ErrorActionPreference = 'Stop'

$skillDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $skillDirectory '..\..\..')).Path
$obsConfig = Join-Path $env:APPDATA 'obs-studio'
$dataDirectory = Join-Path $env:LOCALAPPDATA 'streamoscope'
$installDirectory = Join-Path $env:LOCALAPPDATA 'Programs\streamoscope'
$obsCopy = Join-Path $SnapshotDirectory 'obs-studio'
$failures = 0

Get-ChildItem -LiteralPath (Join-Path $repositoryRoot 'installer\ConfigureObs') -Filter '*.ps1' -Recurse | ForEach-Object { . $_.FullName }
. (Join-Path $repositoryRoot 'installer\updater\UpdateWidget\consts.ps1')
Get-ChildItem -LiteralPath $skillDirectory -Filter '*-*.ps1' | Where-Object { $_.Name -match '^(Get|Write)-' } | ForEach-Object { . $_.FullName }

if (-not (Test-Path -LiteralPath (Join-Path $SnapshotDirectory 'hashes.json'))) {
    throw "$SnapshotDirectory has no snapshot: run Save-LiveSnapshot.ps1 first"
}

$obsFiles = @(@(Get-ObsFiles -Root $obsCopy) + @(Get-ObsFiles -Root $obsConfig) | Sort-Object -Unique)
$appsEntry = Get-ItemProperty -LiteralPath $script:UninstallRegistryKey -ErrorAction SilentlyContinue

switch ($Expect) {
    'Installed' {
        Write-Output 'OBS files changed since the snapshot (expected: user.ini or global.ini for the dock, scene collections for the bridge, the obs-websocket config if it was off):'

        foreach ($relativePath in $obsFiles) {
            $before = Join-Path $obsCopy $relativePath
            $after = Join-Path $obsConfig $relativePath

            if (-not (Test-Path -LiteralPath $before)) {
                Write-Output "  new      $relativePath"
            } elseif (-not (Test-Path -LiteralPath $after)) {
                Write-CheckResult -IsOk $false -Text "OBS $relativePath disappeared"
            } elseif ((Get-FileHash -LiteralPath $before).Hash -ne (Get-FileHash -LiteralPath $after).Hash) {
                $beforeFile = Read-TextFile -Path $before
                $afterFile = Read-TextFile -Path $after
                Write-Output "  changed  $relativePath ($($beforeFile.Text.Length) -> $($afterFile.Text.Length) chars, BOM kept: $($beforeFile.HasBom -eq $afterFile.HasBom))"
            }
        }
    }
    'Unchanged' {
        Write-CheckResult -IsOk ($null -ne $appsEntry) -Text 'the Apps entry is still there'

        foreach ($relativePath in $obsFiles) {
            $before = Join-Path $obsCopy $relativePath
            $after = Join-Path $obsConfig $relativePath
            $isSame = (Test-Path -LiteralPath $before) -and (Test-Path -LiteralPath $after) -and ((Get-FileHash -LiteralPath $before).Hash -eq (Get-FileHash -LiteralPath $after).Hash)
            Write-CheckResult -IsOk $isSame -Text "OBS $relativePath byte for byte"
        }

        $savedHashes = Get-Content -LiteralPath (Join-Path $SnapshotDirectory 'hashes.json') -Raw | ConvertFrom-Json

        foreach ($part in @('data', 'install')) {
            $root = if ($part -eq 'data') { $dataDirectory } else { $installDirectory }
            $currentHashes = Get-TreeHashes -Root $root
            $savedPart = $savedHashes.$part
            $names = @(@($savedPart.PSObject.Properties.Name) + @($currentHashes.Keys) | Select-Object -Unique)
            $changed = @($names | Where-Object { $savedPart.$_ -ne $currentHashes[$_] -and $_ -ne 'configure-obs.log' })
            Write-CheckResult -IsOk ($changed.Count -eq 0) -Text "$part folder unchanged ($($names.Count) files)$(if ($changed.Count) { ': ' + ($changed -join ', ') })"
        }
    }
    'Removed' {
        Write-CheckResult -IsOk ($null -eq $appsEntry) -Text 'the Apps entry is gone'
        Write-CheckResult -IsOk (-not (Test-Path -LiteralPath $installDirectory)) -Text 'the install folder is gone'

        $leftItems = @(if (Test-Path -LiteralPath $dataDirectory) { Get-ChildItem -LiteralPath $dataDirectory -Force -Name | Sort-Object })
        $removedLeft = @($leftItems | Where-Object { $script:RemovedDataItems -contains $_ })
        Write-CheckResult -IsOk ($removedLeft.Count -eq 0) -Text "the data folder keeps only backups and the setup log: $($leftItems -join ', ')"
        Write-CheckResult -IsOk ($leftItems -contains 'configure-obs.log') -Text 'configure-obs.log is kept'

        foreach ($relativePath in $obsFiles) {
            $before = Join-Path $obsCopy $relativePath
            $after = Join-Path $obsConfig $relativePath

            if (-not ((Test-Path -LiteralPath $before) -and (Test-Path -LiteralPath $after))) {
                Write-CheckResult -IsOk $false -Text "OBS $relativePath exists only on one side"
                continue
            }

            if ((Get-FileHash -LiteralPath $before).Hash -eq (Get-FileHash -LiteralPath $after).Hash) {
                Write-CheckResult -IsOk $true -Text "OBS $relativePath byte for byte"
                continue
            }

            $beforeFile = Read-TextFile -Path $before
            $afterFile = Read-TextFile -Path $after

            if ($relativePath -like 'basic\profiles\*\basic.ini') {
                $expectedText = $beforeFile.Text

                foreach ($section in $script:BridgeProfileSections) {
                    $expectedText = Remove-IniSection -Text $expectedText -Section $section
                }

                Write-CheckResult -IsOk (($expectedText -ceq $afterFile.Text) -and ($beforeFile.HasBom -eq $afterFile.HasBom)) -Text "OBS $relativePath equals the copy without the bridge sections"
                continue
            }

            $beforeText = $beforeFile.Text
            $afterText = $afterFile.Text
            $prefixLength = 0

            while ($prefixLength -lt $afterText.Length -and $beforeText[$prefixLength] -ceq $afterText[$prefixLength]) {
                $prefixLength++
            }

            $suffixLength = 0

            while ($suffixLength -lt ($afterText.Length - $prefixLength) -and $beforeText[$beforeText.Length - 1 - $suffixLength] -ceq $afterText[$afterText.Length - 1 - $suffixLength]) {
                $suffixLength++
            }

            $isPureCut = ($beforeText.Length -gt $afterText.Length) -and (($prefixLength + $suffixLength) -eq $afterText.Length)
            $removedText = if ($isPureCut) { $beforeText.Substring($prefixLength, $beforeText.Length - $afterText.Length) } else { '' }
            $isOurs = $removedText -match 'streamoscope'
            Write-CheckResult -IsOk ($isPureCut -and $isOurs -and ($beforeFile.HasBom -eq $afterFile.HasBom)) -Text "OBS $relativePath lost only one piece of ours ($($removedText.Length) chars)"
        }
    }
}

Write-Output "failures: $failures"
