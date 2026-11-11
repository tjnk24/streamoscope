function Invoke-TestEntry {
    param([string]$EntryPath, [string[]]$EntryArguments)

    $arguments = @('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', "`"$EntryPath`"") + $EntryArguments

    return (Start-Process powershell.exe -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden).ExitCode
}
