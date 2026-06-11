# ULSS Inventories Backend

## Setup

1. Copy `.env.example` to `.env` and set your MongoDB Atlas URI and JWT secrets.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the API server:
   ```bash
   npm run dev
   ```

## API Base

- `https://inventorymate.vercel.app/

`

## Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/auth/create-admin` (Super Admin only)

## Create Users from Postman

Use a valid bearer token from `/api/auth/login`.

### Create User

`POST /api/users`

```json
{
   "name": "John Doe",
   "email": "john@example.com",
   "password": "ChangeMe123!",
   "phone": "+123456789",
   "role": "INVENTORY_MANAGER",
   "active": true
}
```

### Create Admin

`POST /api/auth/create-admin`

Bootstrap behavior:
- If there are no users yet, this endpoint can be called without a token to create the first Super Admin.
- After at least one user exists, it requires a valid Super Admin bearer token.

```json
{
   "name": "Admin User",
   "email": "admin2@ulss.com",
   "password": "ChangeMe123!",
   "phone": "+123456789",
   "active": true
}
```

## Resources

- `GET|POST|PUT|DELETE /api/tools`
- `GET|POST|PUT|DELETE /api/spare-parts`
- `GET|POST|PUT|DELETE /api/vehicles`
- `GET|POST|PUT|DELETE /api/technicians`
- `GET|POST|PUT|DELETE /api/maintenance`
- `GET /api/dashboard`

## Default Admin Seed

Optional seed variables:

- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

If these are present, the backend will create a default Super Admin on startup.
