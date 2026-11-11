$script:ConfigureLogPath = $null

function Write-ConfigureLog {
    param(
        [Parameter(Mandatory)][string]$Message
    )

    if ([string]::IsNullOrEmpty($script:ConfigureLogPath)) {
        return
    }

    $line = '{0:yyyy-MM-dd HH:mm:ss} {1}' -f (Get-Date), (Hide-UserPath -Text $Message)

    [System.IO.File]::AppendAllText($script:ConfigureLogPath, $line + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}
