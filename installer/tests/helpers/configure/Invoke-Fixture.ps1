function Invoke-Fixture {
    param($Fixture, [string]$Mode = 'Install')

    return Invoke-ConfigureObs -Mode $Mode -InstallDirectory $Fixture.Install -ConfigDirectory $Fixture.Config -DataDirectory $Fixture.Data
}
