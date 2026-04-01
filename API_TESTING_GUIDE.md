# API Testing Guide with Postman

## Base URL
```
http://localhost:5001/api
```

---

## 📋 Demo Credentials

| Role    | Email                | Password   |
|---------|---------------------|------------|
| Admin   | saurav@example.com  | saurav123  |
| Manager | prem@example.com    | prem123    |
| Manager | dev@example.com     | dev123     |
| User    | raju@example.com    | raju123    |
| User    | meet@example.com    | meet123    |
| User    | demo@example.com    | demo123    |
| User    | test@example.com    | test123    |

---

## 🔐 STEP 1: Login to Get Token

### POST /api/auth/login
**URL:** `http://localhost:5001/api/auth/login`
**Method:** POST
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "email": "saurav@example.com",
  "password": "saurav123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "saurav@example.com",
    "username": "saurav",
    "role": {
      "id": 1,
      "name": "Admin",
      "permissions": ["users:create", "users:read", ...]
    }
  }
}
```

**⚠️ IMPORTANT: Copy the `token` value for all other API calls!**

---

## 🔑 STEP 2: Set Authorization Header

For ALL protected APIs, add this header:
```
Authorization: Bearer <your-token-here>
```

Example:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 API Endpoints

### 1. Register New User
**POST** `http://localhost:5001/api/auth/register`
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "newuser123"
}
```

---

### 2. Get Current User Profile
**GET** `http://localhost:5001/api/auth/me`
**Headers:** `Authorization: Bearer <token>`

---

### 3. Get All Tasks
**GET** `http://localhost:5001/api/tasks`
**Headers:** `Authorization: Bearer <token>`

**With Filter:**
- `http://localhost:5001/api/tasks?status=TODO`
- `http://localhost:5001/api/tasks?status=IN_PROGRESS`
- `http://localhost:5001/api/tasks?status=COMPLETED`

---

### 4. Get Task Statistics
**GET** `http://localhost:5001/api/tasks/stats`
**Headers:** `Authorization: Bearer <token>`

---

### 5. Get Single Task
**GET** `http://localhost:5001/api/tasks/1`
**Headers:** `Authorization: Bearer <token>`

---

### 6. Create New Task
**POST** `http://localhost:5001/api/tasks`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "My New Task",
  "description": "This is a test task",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-04-15"
}
```

---

### 7. Update Task
**PUT** `http://localhost:5001/api/tasks/1`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "Updated Task Title",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

---

### 8. Delete Task
**DELETE** `http://localhost:5001/api/tasks/1`
**Headers:** `Authorization: Bearer <token>`

---

### 9. Get All Users (Admin/Manager only)
**GET** `http://localhost:5001/api/users`
**Headers:** `Authorization: Bearer <token>`

---

### 10. Get All Roles
**GET** `http://localhost:5001/api/users/roles`
**Headers:** `Authorization: Bearer <token>`

---

### 11. Create User (Admin only)
**POST** `http://localhost:5001/api/users`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "newstaff@example.com",
  "username": "newstaff",
  "password": "newstaff123",
  "roleId": 3
}
```
*roleId: 1=Admin, 2=Manager, 3=User*

---

### 12. Update User (Admin only)
**PUT** `http://localhost:5001/api/users/5`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "username": "updatedname",
  "roleId": 2
}
```

---

### 13. Delete User (Admin only)
**DELETE** `http://localhost:5001/api/users/5`
**Headers:** `Authorization: Bearer <token>`

---

### 14. Change User Role (Admin only)
**PUT** `http://localhost:5001/api/users/5/role`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "roleId": 2
}
```

---

## 🧪 Quick Test with PowerShell/CMD

### Login and get token:
```powershell
$body = @{email="saurav@example.com"; password="saurav123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Get tasks with token:
```powershell
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5001/api/tasks" -Headers $headers | ConvertTo-Json
```

---

## ⚠️ Common Errors

| Error | Meaning |
|-------|---------|
| 401 Unauthorized | Token missing or expired - login again |
| 403 Forbidden | User doesn't have permission for this action |
| 404 Not Found | Resource doesn't exist |
| 400 Bad Request | Invalid data sent |

---

## 📱 Postman Setup Tips

1. Create a new **Collection** called "Task Management API"
2. Add a **Collection Variable** called `token`
3. In Login request, add this **Test script**:
   ```javascript
   var response = pm.response.json();
   pm.collectionVariables.set("token", response.token);
   ```
4. In other requests, set Authorization header to: `Bearer {{token}}`
