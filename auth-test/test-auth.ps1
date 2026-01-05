# Authentication Test Suite using PowerShell
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔒 AUTHENTICATION SECURITY TEST SUITE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/auth"
$testResults = @()
$token = ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n🧪 $Name" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $result = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: Status $($response.StatusCode)" -ForegroundColor Green
            return @{ Passed = $true; Data = $result }
        } else {
            Write-Host "❌ FAIL: Expected $ExpectedStatus, got $($response.StatusCode)" -ForegroundColor Red
            return @{ Passed = $false; Data = $result }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $null
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            $reader.Close()
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: Status $statusCode (Expected failure)" -ForegroundColor Green
            return @{ Passed = $true; Data = $errorBody }
        } else {
            Write-Host "❌ FAIL: Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            return @{ Passed = $false; Data = $errorBody }
        }
    }
}

# Test 1: Valid Registration
$result = Test-Endpoint -Name "Test 1: Valid Registration" `
    -Endpoint "/register" `
    -Method "POST" `
    -Body @{
        username = "testuser"
        email = "test@example.com"
        password = "password123"
    } `
    -ExpectedStatus 201

if ($result.Passed -and $result.Data.token) {
    $token = $result.Data.token
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
}
$testResults += $result.Passed

# Test 2: Duplicate Registration
$result = Test-Endpoint -Name "Test 2: Duplicate Registration (should fail)" `
    -Endpoint "/register" `
    -Method "POST" `
    -Body @{
        username = "testuser"
        email = "test@example.com"
        password = "password123"
    } `
    -ExpectedStatus 409
$testResults += $result.Passed

# Test 3: Short Password
$result = Test-Endpoint -Name "Test 3: Short Password (< 6 chars)" `
    -Endpoint "/register" `
    -Method "POST" `
    -Body @{
        username = "user2"
        email = "user2@example.com"
        password = "12345"
    } `
    -ExpectedStatus 400
$testResults += $result.Passed

# Test 4: Missing Fields
$result = Test-Endpoint -Name "Test 4: Missing Required Fields" `
    -Endpoint "/register" `
    -Method "POST" `
    -Body @{
        username = "user3"
    } `
    -ExpectedStatus 400
$testResults += $result.Passed

# Test 5: Valid Login
$result = Test-Endpoint -Name "Test 5: Valid Login" `
    -Endpoint "/login" `
    -Method "POST" `
    -Body @{
        email = "test@example.com"
        password = "password123"
    } `
    -ExpectedStatus 200

if ($result.Passed -and $result.Data.token) {
    Write-Host "   Login successful, token received" -ForegroundColor Gray
}
$testResults += $result.Passed

# Test 6: Invalid Password
$result = Test-Endpoint -Name "Test 6: Invalid Password" `
    -Endpoint "/login" `
    -Method "POST" `
    -Body @{
        email = "test@example.com"
        password = "wrongpassword"
    } `
    -ExpectedStatus 401
$testResults += $result.Passed

# Test 7: Non-Existent User
$result = Test-Endpoint -Name "Test 7: Non-Existent User" `
    -Endpoint "/login" `
    -Method "POST" `
    -Body @{
        email = "notexist@example.com"
        password = "password123"
    } `
    -ExpectedStatus 401
$testResults += $result.Passed

# Test 8: Protected Route with Token
$result = Test-Endpoint -Name "Test 8: Protected Route with Valid Token" `
    -Endpoint "/me" `
    -Method "GET" `
    -Token $token `
    -ExpectedStatus 200

if ($result.Passed -and $result.Data.user) {
    Write-Host "   User: $($result.Data.user.username)" -ForegroundColor Gray
    if ($result.Data.user.password) {
        Write-Host "   ⚠️  WARNING: Password exposed in response!" -ForegroundColor Red
    }
}
$testResults += $result.Passed

# Test 9: Protected Route without Token
$result = Test-Endpoint -Name "Test 9: Protected Route without Token" `
    -Endpoint "/me" `
    -Method "GET" `
    -ExpectedStatus 401
$testResults += $result.Passed

# Test 10: Protected Route with Invalid Token
$result = Test-Endpoint -Name "Test 10: Protected Route with Invalid Token" `
    -Endpoint "/me" `
    -Method "GET" `
    -Token "invalid-token-12345" `
    -ExpectedStatus 401
$testResults += $result.Passed

# Summary
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count
$failed = $total - $passed
$successRate = [math]::Round(($passed / $total) * 100, 0)

Write-Host "`n✅ Passed: $passed/$total" -ForegroundColor Green
Write-Host "❌ Failed: $failed/$total" -ForegroundColor Red
Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Cyan

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($passed -eq $total) {
    Write-Host "🎉 ALL TESTS PASSED! Authentication is secure!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Review the output above." -ForegroundColor Yellow
}

Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
