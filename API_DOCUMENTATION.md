# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔓 Public Endpoints (No Authentication Required)

### 1. User Signup

**Endpoint:** `POST /auth/signup`

**Request Body:**

```json
{
  "name": "John Doe With Long Name",
  "email": "john@example.com",
  "password": "Password@123",
  "address": "123 Main Street, New York, NY 10001"
}
```

**Response:**

```json
{
  "message": "User registered successfully"
}
```

**Validation:**

- name: 20-60 characters
- email: valid email format
- password: 8-16 chars, 1 uppercase, 1 special char
- address: max 400 characters

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe With Long Name",
    "email": "john@example.com",
    "role": "user",
    "address": "123 Main Street, New York, NY 10001"
  }
}
```

---

### 3. Admin Register User

**Endpoint:** `POST /auth/admin-register`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "Jane Admin User Name",
  "email": "jane@example.com",
  "password": "Admin@456",
  "address": "456 Admin Avenue",
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "admin user created successfully"
}
```

**Roles:** "admin", "user", "store_owner"

---

## 👨‍💼 Admin Endpoints (Requires: admin role)

### Dashboard

**Endpoint:** `GET /admin/dashboard`

**Response:**

```json
{
  "totalUsers": 10,
  "totalStores": 5,
  "totalRatings": 23
}
```

---

### Store Management

**Create Store:**

```
POST /admin/stores
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Excellent Pizza Restaurant Place",
  "email": "pizza@example.com",
  "address": "789 Food Street, Chicago, IL 60601",
  "owner_id": 2
}
```

**Get All Stores:**

```
GET /admin/stores?name=Pizza&sortBy=name&order=ASC
```

**Query Parameters:**

- `name`: Filter by store name
- `email`: Filter by store email
- `address`: Filter by address
- `sortBy`: name, email, address, average_rating
- `order`: ASC or DESC

**Response:**

```json
[
  {
    "id": 1,
    "name": "Excellent Pizza Restaurant Place",
    "email": "pizza@example.com",
    "address": "789 Food Street, Chicago, IL 60601",
    "average_rating": 4.5
  }
]
```

**Get Store Details:**

```
GET /admin/stores/1
```

**Update Store:**

```
PUT /admin/stores/1
{
  "name": "Updated Pizza Place",
  "email": "newpizza@example.com",
  "address": "New Address"
}
```

**Delete Store:**

```
DELETE /admin/stores/1
```

---

### User Management

**Get All Users:**

```
GET /admin/users?role=user&sortBy=name&order=ASC
```

**Query Parameters:**

- `role`: "user", "store_owner", "admin"
- `name`: Filter by name
- `email`: Filter by email
- `address`: Filter by address
- `sortBy`: name, email, address, role
- `order`: ASC or DESC

**Response:**

```json
[
  {
    "id": 3,
    "name": "Regular User Full Name",
    "email": "user@example.com",
    "address": "123 User St",
    "role": "user"
  }
]
```

**Get User Details:**

```
GET /admin/users/3
```

**Response:**

```json
{
  "id": 3,
  "name": "Regular User Full Name",
  "email": "user@example.com",
  "address": "123 User St",
  "role": "user",
  "store_id": null,
  "storeRating": null
}
```

_For store owners:_

```json
{
  "id": 2,
  "name": "Store Owner Full Name",
  "email": "owner@example.com",
  "address": "456 Owner Ave",
  "role": "store_owner",
  "store_id": 1,
  "storeRating": 4.5
}
```

**Delete User:**

```
DELETE /admin/users/3
```

---

## 👤 Normal User Endpoints (Requires: user role)

### Profile

**Get Profile:**

```
GET /user/profile
```

**Response:**

```json
{
  "id": 3,
  "name": "Regular User Full Name",
  "email": "user@example.com",
  "address": "123 User St",
  "role": "user"
}
```

**Update Password:**

```
PUT /user/password
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

---

### Store Operations

**Get All Stores:**

```
GET /user/stores?name=Pizza&sortBy=average_rating&order=DESC
```

**Query Parameters:**

- `name`: Search by store name
- `address`: Search by address
- `sortBy`: name, address, average_rating
- `order`: ASC or DESC

**Response:**

```json
[
  {
    "id": 1,
    "name": "Excellent Pizza Restaurant Place",
    "address": "789 Food Street, Chicago, IL 60601",
    "average_rating": 4.5,
    "userRating": 4
  }
]
```

**Get Store Details:**

```
GET /user/stores/1
```

---

### Rating Operations

**Submit Rating:**

```
POST /user/stores/1/rate
{
  "rating": 5
}
```

**Response:**

```json
{
  "message": "Rating submitted successfully"
}
```

**Update Rating:**

```
PUT /user/stores/1/rate
{
  "rating": 4
}
```

**Get My Ratings:**

```
GET /user/my-ratings
```

**Response:**

```json
[
  {
    "id": 5,
    "store_id": 1,
    "rating": 4,
    "store_name": "Excellent Pizza Restaurant Place",
    "address": "789 Food Street, Chicago, IL 60601"
  }
]
```

---

## 🏪 Store Owner Endpoints (Requires: store_owner role)

### Dashboard

**Get Dashboard:**

```
GET /store-owner/dashboard
```

**Response:**

```json
{
  "message": "No store assigned",
  "store": null,
  "totalRatings": 0
}
```

**Or (with assigned store):**

```json
{
  "store": {
    "id": 1,
    "name": "Excellent Pizza Restaurant Place",
    "averageRating": 4.5
  },
  "totalRatings": 10
}
```

---

### Store Metrics

**Get Store Ratings:**

```
GET /store-owner/store/ratings
```

**Response:**

```json
[
  {
    "id": 1,
    "rating": 5,
    "created_at": "2024-01-15T10:30:00Z",
    "user_name": "John Doe",
    "user_email": "john@example.com"
  }
]
```

**Get Average Rating:**

```
GET /store-owner/store/average-rating
```

**Response:**

```json
{
  "averageRating": 4.5
}
```

---

### Profile

**Get Profile:**

```
GET /store-owner/profile
```

**Response:**

```json
{
  "id": 2,
  "name": "Store Owner Full Name",
  "email": "owner@example.com",
  "address": "456 Owner Ave",
  "role": "store_owner"
}
```

**Update Password:**

```
PUT /store-owner/password
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Password must contain at least one uppercase letter and one special character"
}
```

### 401 Unauthorized

```json
{
  "message": "Access token required"
}
```

### 403 Forbidden

```json
{
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error"
}
```

---

## Status Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | OK - Request successful              |
| 201  | Created - Resource created           |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - No permission            |
| 404  | Not Found - Resource doesn't exist   |
| 500  | Server Error - Internal error        |

---

## Testing with cURL

### Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Test User",
    "email": "john@example.com",
    "password": "Password@123",
    "address": "123 Main Street"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'
```

### Get Stores (with token)

```bash
curl -X GET http://localhost:5000/api/user/stores \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Submit Rating

```bash
curl -X POST http://localhost:5000/api/user/stores/1/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "rating": 5
  }'
```

---

## Important Notes

1. **JWT Tokens:** Tokens expire after 7 days (configurable in .env)
2. **Password Reset:** No built-in password reset - users must contact admin
3. **Rating Uniqueness:** Users can only rate each store once (update after)
4. **Average Rating:** Updated automatically when a rating is added/modified
5. **Pagination:** Can be added to listing endpoints if needed
6. **Token Storage:** Frontend stores token in localStorage

---

## Rate Limiting Recommendations

For production, implement rate limiting:

```
/auth/login - 5 requests per 15 minutes per IP
/auth/signup - 3 requests per hour per IP
Other endpoints - 100 requests per minute per user
```

---

For more details, see [README.md](README.md)
