function Invoke-TestAutoUpdate {
    param($Release)

    return Invoke-AutoUpdate -InstallDirectory $Release.Install -StatusPath $Release.Status -ReleaseBaseUrl $Release.BaseUrl -LatestReleaseUrl $Release.LatestUrl -PublicKey $script:releaseKey.Public -MinisignPath $script:minisign
}
