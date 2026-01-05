# Manual Testing Guide

## Prerequisites
1. Create a new project:
```bash
npx lazy-express-crud my-api
cd my-api
```

2. Add authentication:
```bash
npx add-auth
npm install
```

3. Start the server:
```bash
node src/server.js
```

## Test 1: Register New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"email\":\"john@example.com\",\"password\":\"secret123\"}"
```

**PowerShell:**
```powershell
$body = @{ username='john'; email='john@example.com'; password='secret123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "1234567890",
    "username": "john",
    "email": "john@example.com",
    "createdAt": "2026-01-05T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Security Check:** ✅ Password should NOT appear in response

---

## Test 2: Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"secret123\"}"
```

**PowerShell:**
```powershell
$body = @{ email='john@example.com'; password='secret123' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
$token = $response.token
echo "Token: $token"
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1234567890",
    "username": "john",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Test 3: Get Current User (Protected)

**Request:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/me' -Headers $headers
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "1234567890",
    "username": "john",
    "email": "john@example.com",
    "createdAt": "2026-01-05T..."
  }
}
```

---

## Test 4: Access Protected Route Without Token

**Request:**
```bash
curl http://localhost:3000/api/auth/me
```

**Expected Response (401):**
```json
{
  "message": "No token provided"
}
```

**Security Check:** ✅ Should deny access

---

## Test 5: Invalid Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"wrongpassword\"}"
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Security Check:** ✅ Generic message (doesn't reveal if email exists)

---

## Test 6: Duplicate Registration

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john2\",\"email\":\"john@example.com\",\"password\":\"secret123\"}"
```

**Expected Response (409):**
```json
{
  "message": "User already exists"
}
```

---

## Test 7: Short Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"jane\",\"email\":\"jane@example.com\",\"password\":\"12345\"}"
```

**Expected Response (400):**
```json
{
  "message": "Password must be between 6 and 128 characters"
}
```

---

## Test 8: Missing Fields

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"bob\"}"
```

**Expected Response (400):**
```json
{
  "message": "All fields are required"
}
```

---

## Complete PowerShell Test Script

```powershell
# Save token for later use
$global:token = ""

Write-Host "Test 1: Register" -ForegroundColor Yellow
$body = @{ username='testuser'; email='test@example.com'; password='password123' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' -Method POST -Body $body -ContentType 'application/json'
$global:token = $response.token
Write-Host "✅ Registered: $($response.user.email)" -ForegroundColor Green

Write-Host "`nTest 2: Login" -ForegroundColor Yellow
$body = @{ email='test@example.com'; password='password123' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
Write-Host "✅ Logged in: $($response.user.username)" -ForegroundColor Green

Write-Host "`nTest 3: Get Current User" -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $global:token" }
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/me' -Headers $headers
Write-Host "✅ Current user: $($response.user.email)" -ForegroundColor Green

Write-Host "`nTest 4: Invalid Password" -ForegroundColor Yellow
try {
    $body = @{ email='test@example.com'; password='wrong' } | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
} catch {
    Write-Host "✅ Invalid password rejected" -ForegroundColor Green
}

Write-Host "`nTest 5: No Token" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/me'
} catch {
    Write-Host "✅ Access denied without token" -ForegroundColor Green
}

Write-Host "`n🎉 All manual tests completed!" -ForegroundColor Cyan
```

---

## Using Postman

1. Import the generated collection:
   ```bash
   npx gen-postman
   ```

2. Import `postman-collection.json` into Postman

3. The collection includes all auth endpoints with example requests

4. To use protected routes:
   - First, call `POST /api/auth/register` or `/api/auth/login`
   - Copy the `token` from the response
   - In Postman, go to Headers tab
   - Add: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## Security Validation Checklist

- [ ] Password is hashed (not plain text in memory)
- [ ] Password never appears in API responses
- [ ] JWT token is generated on register/login
- [ ] Protected routes require valid token
- [ ] Invalid tokens are rejected
- [ ] Duplicate emails are blocked
- [ ] Short passwords are rejected
- [ ] Missing fields are rejected
- [ ] Invalid credentials use generic message
- [ ] Non-existent users handled securely (no info leakage)

---

## Troubleshooting

**Server won't start:**
- Make sure you ran `npm install` after `add-auth`
- Check that bcryptjs and jsonwebtoken are in package.json
- Verify server.js has the auth routes imported

**401 Unauthorized on protected routes:**
- Make sure Authorization header is: `Bearer TOKEN` (with space)
- Check token is not expired (default 24h)
- Verify JWT_SECRET is set in .env

**Can't register user:**
- Check all required fields: username, email, password
- Password must be 6-128 characters
- Email must be unique

---

**Documentation generated for**: lazy-express-crud v1.1.0  
**Date**: January 5, 2026
