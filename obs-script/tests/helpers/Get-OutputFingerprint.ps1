function Get-OutputFingerprint {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string[]]$Parts
    )

    $utf8 = [System.Text.Encoding]::UTF8
    $registry = [Microsoft.Win32.RegistryKey]::OpenBaseKey([Microsoft.Win32.RegistryHive]::LocalMachine, [Microsoft.Win32.RegistryView]::Registry64)

    try {
        $machineGuid = $registry.OpenSubKey($script:MachineGuidKey).GetValue($script:MachineGuidValue)
    } finally {
        $registry.Dispose()
    }

    $hmac = New-Object System.Security.Cryptography.HMACSHA256 (, $utf8.GetBytes($script:FingerprintSalt + $machineGuid))

    try {
        $message = -join ($Parts | ForEach-Object { $_ + "`n" })
        $digest = $hmac.ComputeHash($utf8.GetBytes($message))
    } finally {
        $hmac.Dispose()
    }

    return -join ($digest[0..($script:FingerprintBytes - 1)] | ForEach-Object { $_.ToString('x2') })
}
