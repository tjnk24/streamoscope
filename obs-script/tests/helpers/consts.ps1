$script:LuaLibraryRelativePath = '.test-stand\lua\bin\64bit\lua51.dll'
$script:UserDirectoryName = -join ([char[]](0x0418, 0x0432, 0x0430, 0x043D, 0x20, 0x041F, 0x0435, 0x0442, 0x0440, 0x043E, 0x0432))
$script:NewVersion = '2.0.0'
$script:PreviousVersion = '1.0.0'
$script:CurrentVersionTemplate = "window.STREAMOSCOPE_VERSION = '{0}';`r`n"
$script:TrialTemplate = "version={0}`r`nprevious={1}`r`npanel={2}`r`nprocess={3}`r`nlaunches={4}`r`n"
$script:FakeProcessId = 1
$script:NoBridgeResult = '-'
$script:BrokenBridgeSource = "assert(false, 'boom')`n"
$script:MainModuleRelativePath = 'streamoscope-bridge\main.lua'
$script:LoaderFileName = 'streamoscope-bridge.lua'
$script:ScriptLoadLine = "function script_load(_settings)`n"
$script:UpdaterStub = @'
param([string]$Version, [switch]$Auto)
[System.IO.File]::WriteAllText($env:MARKER_FILE, "version=$Version auto=$Auto")
'@
$script:FingerprintSalt = 'streamoscope:'
$script:FingerprintBytes = 4
$script:MachineGuidKey = 'SOFTWARE\Microsoft\Cryptography'
$script:MachineGuidValue = 'MachineGuid'
$script:OutputWithStats = '{"id":"a3f91c07","name":"multi-output","server":"rtmp://live.example.com","stats":{"congestion":0.5,"droppedFrames":3,"durationMs":10000,"isActive":true,"isReconnecting":false,"totalBytes":1250000,"totalFrames":600}}'
$script:FallbackOutput = '{"name":"fallback-output","server":"rtmp://fallback.example.com"}'
