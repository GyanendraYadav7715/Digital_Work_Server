# 🚀 Create User by Admin API

This API allows a Superadmin to create new `Retailer` or `BackOffice` users. The admin must be authenticated using a valid JWT token.

---

## 🔐 Authorization

- Requires JWT authentication.
- Token should be sent via:
  - **Header**: `Authorization: Bearer <token>`  
    or  
  - **Cookie**: `token=<jwt_token>`

---

## 🔧 Endpoint

**POST** `/api/admin/create-user`

---

## 📥 Request Body (JSON)

| Field        | Type    | Required | Description                              |
|--------------|---------|----------|------------------------------------------|
| `username`   | String  | ✅       | Unique username for the new user         |
| `password`   | String  | ✅       | Password (will be hashed)                |
| `user_role`  | String  | ✅       | Either `Retailer` or `BackOffice`        |
| `balance`    | Number  | ✅       | Initial balance to assign                |
| `email`      | String  | ⚠️ *Only for Retailer* | User email           |
| `phone_number` | String | ⚠️ *Only for Retailer* | User phone number     |
| `latitude`   | Number  | ✅       | Geographical latitude                    |
| `longitude`  | Number  | ✅       | Geographical longitude                   |

---

## 🧪 Sample JSON for Postman

### 🛒 Retailer
```json
{
  "username": "retail_demo_01",
  "password": "RetailPass@123",
  "user_role": "Retailer",
  "balance": 500,
  "email": "retailer@example.com",
  "phone_number": "9876543210",
  "latitude": 28.67508,
  "longitude": 77.08954
}
