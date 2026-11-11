function Save-ObsChanges {
    param(
        [Parameter(Mandatory)][object[]]$Changes,
        [Parameter(Mandatory)][string]$BackupRoot
    )

    $backupDirectory = Join-Path $BackupRoot (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')

    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

    $backups = @()
    $fileIndex = 0

    foreach ($change in $Changes) {
        $fileIndex += 1
        $backupPath = Join-Path $backupDirectory ('{0:D2}_{1}' -f $fileIndex, [System.IO.Path]::GetFileName($change.Path))

        Copy-Item -LiteralPath $change.Path -Destination $backupPath -Force
        $backups += [pscustomobject]@{Original = $change.Path; Backup = $backupPath}
    }

    $backups | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDirectory 'backup.json') -Encoding UTF8
    Write-ConfigureLog "Backup: $backupDirectory"

    try {
        foreach ($change in $Changes) {
            Write-TextFile -Path $change.Path -Text $change.Text -HasBom $change.HasBom
            Write-ConfigureLog "Written: $($change.Path) ($($change.Description))"
        }
    } catch {
        Write-ConfigureLog "Write failed: $($_.Exception.Message). Restoring the backup"

        foreach ($backup in $backups) {
            Copy-Item -LiteralPath $backup.Backup -Destination $backup.Original -Force
            Write-ConfigureLog "Restored: $($backup.Original)"
        }

        throw
    }

    try {
        Get-ChildItem -LiteralPath $BackupRoot -Directory |
            Sort-Object Name -Descending |
            Select-Object -Skip $script:KeptBackups |
            Remove-Item -Recurse -Force
    } catch {
        Write-ConfigureLog "Old backups were not removed: $($_.Exception.Message)"
    }
}
