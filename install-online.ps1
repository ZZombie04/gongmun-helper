# Gongmun Helper - one-line setup (no zip to download, unblock or extract by hand).
#
#   Press Win+R, paste the line below, press Enter:
#
#   powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; irm https://raw.githubusercontent.com/ZZombie04/gongmun-helper/main/install-online.ps1 | iex"
#
# What it does: reads latest.json from this repository, downloads the setup zip it names, checks the
# zip's SHA-256 against latest.json, extracts it to the temp folder and runs the same install.ps1 that
# the zip's own setup batch file runs. Files fetched this way carry no "downloaded from the internet" mark,
# so nothing has to be unblocked. Nothing about this PC is sent anywhere.
# This file is ASCII only (Korean text is written as \uXXXX) so that it survives any download encoding.
$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
function U([string]$s) { return [regex]::Unescape($s) }
function Say([string]$s, [string]$c = "Gray") { Write-Host (U $s) -ForegroundColor $c }

$repo = "https://raw.githubusercontent.com/ZZombie04/gongmun-helper/main/"
$tmp = $null
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
  Write-Host ""
  Say "  \uACF5\uBB38 \uB3C4\uC6B0\uBBF8\uB97C \uB0B4\uB824\uBC1B\uC2B5\uB2C8\uB2E4..." "Cyan"

  $wc = New-Object System.Net.WebClient
  $wc.Encoding = [System.Text.Encoding]::UTF8
  $wc.Headers.Add("User-Agent", "GongmunHelper-OnlineSetup")
  $info = $wc.DownloadString($repo + "latest.json") | ConvertFrom-Json
  if (-not $info -or -not $info.version -or -not $info.zip) { throw (U "\uC548\uB0B4 \uD30C\uC77C(latest.json)\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.") }
  Say ("  \uCD5C\uC2E0 \uBC84\uC804: v" + [string]$info.version)

  $tmp = Join-Path $env:TEMP ("GongmunHelper-setup-" + [string]$info.version)
  if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue }
  [void][System.IO.Directory]::CreateDirectory($tmp)
  $zip = Join-Path $tmp "setup.zip"
  $wc.Headers.Set("User-Agent", "GongmunHelper-OnlineSetup")
  $wc.DownloadFile([string]$info.zip, $zip)

  if ($info.sha256) {
    $h = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
    if ($h.ToLower() -ne ([string]$info.sha256).Trim().ToLower()) { throw (U "\uB0B4\uB824\uBC1B\uC740 \uD30C\uC77C\uC758 \uD655\uC778\uAC12(SHA-256)\uC774 \uC548\uB0B4\uC640 \uB2E4\uB985\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uD574 \uBCF4\uC138\uC694.") }
  }
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $out = Join-Path $tmp "x"
  [System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $out)
  $inst = Join-Path $out "install.ps1"
  if (-not (Test-Path -LiteralPath $inst)) { throw (U "\uC124\uCE58 \uD30C\uC77C(install.ps1)\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") }
} catch {
  Write-Host ""
  Say ("  [\uC624\uB958] \uB0B4\uB824\uBC1B\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: " + $_.Exception.Message) "Red"
  Say "         \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uAC70\uB098, \uC800\uC7A5\uC18C\uC5D0\uC11C zip \uC744 \uBC1B\uC544 \uC124\uCE58\uD558\uC138\uC694." "Yellow"
  Write-Host "         https://github.com/ZZombie04/gongmun-helper" -ForegroundColor Yellow
  Write-Host ""
  Read-Host (U "  \uC5D4\uD130\uB97C \uB204\uB974\uBA74 \uB2EB\uD799\uB2C8\uB2E4") | Out-Null
  return
}

# Run the installer from its text: this works whatever the execution policy is.
$env:GMH_SRC = $out + "\"
& ([scriptblock]::Create([System.IO.File]::ReadAllText($inst, [System.Text.Encoding]::UTF8)))
