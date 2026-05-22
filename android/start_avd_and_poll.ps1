Start-Process -FilePath 'C:\Users\Gabs\AppData\Local\Android\Sdk\emulator\emulator.exe' -ArgumentList '-avd','Pixel_8_API_35','-no-window','-gpu','swiftshader_indirect','-no-snapshot-load' -PassThru | Out-Null
for ($i = 0; $i -lt 40; $i++) {
    Write-Output "polling:$i"
    & 'C:\Users\Gabs\AppData\Local\Android\Sdk\platform-tools\adb.exe' devices
    Start-Sleep -Seconds 2
}
