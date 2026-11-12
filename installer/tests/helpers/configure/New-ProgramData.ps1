function New-ProgramData {
    param([string]$DataDirectory)

    New-Item -ItemType Directory -Path (Join-Path $DataDirectory 'logs') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $DataDirectory 'backups\2026-01-01_00-00-00') -Force | Out-Null

    foreach ($fileName in @('logs\streamoscope.log', 'journal.txt', 'auto-update.txt', 'update-status.json', 'update-status.json.lock', 'update-check.stamp', 'backups\2026-01-01_00-00-00\global.ini', 'configure-obs.log')) {
        Set-Content -LiteralPath (Join-Path $DataDirectory $fileName) -Value 'data'
    }
}
