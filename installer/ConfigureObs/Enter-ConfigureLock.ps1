function Enter-ConfigureLock {
    $lock = [System.Threading.Mutex]::new($false, $script:ConfigureLockName)

    try {
        if ($lock.WaitOne($script:ConfigureLockTimeout)) {
            return $lock
        }
    } catch [System.Threading.AbandonedMutexException] {
        return $lock
    }

    $lock.Dispose()

    return $null
}
