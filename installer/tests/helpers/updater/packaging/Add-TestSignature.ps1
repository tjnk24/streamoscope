function Add-TestSignature {
    param([string]$Path, $Key)

    & $script:minisign -S -s $Key.Secret -m $Path | Out-Null
}
