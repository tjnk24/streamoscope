function Invoke-TestUpdate {
    param($Release, [string]$Version = '0.2.0')

    return Invoke-UpdateWidget -Version $Version -InstallDirectory $Release.Install -StatusPath $Release.Status -ReleaseBaseUrl $Release.BaseUrl -PublicKey $script:releaseKey.Public -MinisignPath $script:minisign
}
