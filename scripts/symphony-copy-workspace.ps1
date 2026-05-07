$ErrorActionPreference = "Stop"

$source = "C:\Users\qtran47\devs\Nerd_App"
$destination = (Get-Location).Path

$items = @(
  ".env.example",
  ".gitignore",
  "README.md",
  "apps",
  "docs",
  "package-lock.json",
  "package.json",
  "packages"
)

foreach ($item in $items) {
  $sourcePath = Join-Path $source $item
  if (Test-Path -LiteralPath $sourcePath) {
    Copy-Item -LiteralPath $sourcePath -Destination $destination -Recurse -Force
  }
}

$removeItems = @(
  "apps\web\.next",
  "apps\web\node_modules",
  "node_modules"
)

foreach ($item in $removeItems) {
  $target = Join-Path $destination $item
  if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
}
