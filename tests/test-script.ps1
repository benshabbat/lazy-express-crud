# Test script for lazy-express-crud

$testDir = "$env:TEMP\test-lazy-express"

# Clean and create test directory
if (Test-Path $testDir) {
    Remove-Item -Recurse -Force $testDir
}
New-Item -ItemType Directory -Force $testDir | Out-Null

# Use current directory
$scriptDir = Get-Location
Write-Host "Script directory: $scriptDir"

Write-Host "Testing JavaScript project generation with MongoDB..." -ForegroundColor Green

# Create input file for automated answers
# 1 = JavaScript, 1 = MongoDB
$inputAnswers = "1`n1`n"
$inputAnswers | node generateExpressCrud.js "$testDir\test-js-mongo"

Write-Host "`nChecking generated files..." -ForegroundColor Green
Get-ChildItem -Path "$testDir\test-js-mongo" -Recurse | Select-Object FullName

Write-Host "`nRunning npm install..." -ForegroundColor Green
Set-Location "$testDir\test-js-mongo"
npm install

Write-Host "`nTest completed!" -ForegroundColor Green
