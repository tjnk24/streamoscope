$script:ConfigureLogPath = $null

function Write-ConfigureLog {
    param(
        [Parameter(Mandatory)][string]$Message
    )

    if ([string]::IsNullOrEmpty($script:ConfigureLogPath)) {
        return
    }

    $line = '{0:yyyy-MM-dd HH:mm:ss} [{1}] {2}' -f (Get-Date), $PID, (Hide-UserPath -Text $Message)

    [System.IO.File]::AppendAllText($script:ConfigureLogPath, $line + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}
