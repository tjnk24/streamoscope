function Get-UpdateFile {
    param(
        [Parameter(Mandatory)][string]$Url,
        [Parameter(Mandatory)][string]$Path,
        [scriptblock]$OnProgress
    )

    $request = [System.Net.WebRequest]::Create($Url)
    $request.Timeout = $script:DownloadTimeoutMilliseconds

    if ($request -is [System.Net.HttpWebRequest]) {
        $request.ReadWriteTimeout = $script:DownloadTimeoutMilliseconds
        $request.UserAgent = 'streamoscope-updater'
    }

    $response = $request.GetResponse()

    try {
        $total = $response.ContentLength
        $stream = $response.GetResponseStream()
        $file = [System.IO.File]::Create($Path)

        try {
            $buffer = New-Object byte[] $script:DownloadBufferBytes
            $received = 0
            $reportedPercent = -1
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

            while (($read = $stream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                if ($stopwatch.ElapsedMilliseconds -gt $script:DownloadDeadlineMilliseconds) {
                    throw "Download took longer than $($script:DownloadDeadlineMilliseconds) ms: $Url"
                }

                $file.Write($buffer, 0, $read)
                $received += $read

                if ($null -ne $OnProgress -and $total -gt 0) {
                    $percent = [int][Math]::Floor($received * 100 / $total)

                    if ($percent -ne $reportedPercent) {
                        & $OnProgress $percent
                        $reportedPercent = $percent
                    }
                }
            }

            if ($total -ge 0 -and $received -ne $total) {
                throw "Download ended after $received of $total bytes: $Url"
            }
        } finally {
            $file.Dispose()
            $stream.Dispose()
        }
    } finally {
        $response.Dispose()
    }
}
