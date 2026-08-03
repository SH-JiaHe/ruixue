$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$publishDir = Join-Path $env:TEMP ("ruixue-gh-pages-" + (Get-Date -Format "yyyyMMddHHmmss"))

Push-Location $repoRoot
try {
  $env:VITE_BASE_PATH = "/ruixue/"
  npm run build
  Remove-Item Env:VITE_BASE_PATH -ErrorAction SilentlyContinue

  New-Item -ItemType Directory -Force -Path $publishDir | Out-Null
  Copy-Item -LiteralPath (Join-Path $repoRoot "dist\client\*") -Destination $publishDir -Recurse -Force
  New-Item -ItemType File -Path (Join-Path $publishDir ".nojekyll") -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $publishDir "index.html") -Destination (Join-Path $publishDir "404.html") -Force

  Push-Location $publishDir
  try {
    git init -b gh-pages
    git config user.name "Codex"
    git config user.email "codex@openai.local"
    git add .
    git commit -m "Deploy GitHub Pages"
    git remote add origin "https://github.com/SH-JiaHe/ruixue.git"
    git push -f origin gh-pages
  } finally {
    Pop-Location
  }
} finally {
  Remove-Item Env:VITE_BASE_PATH -ErrorAction SilentlyContinue
  Pop-Location
}

Write-Host "Published. Open: https://sh-jiahe.github.io/ruixue/"
