# Task Management System

A full-stack task management application with role-based access control (RBAC) built with React, Node.js, Express, and SQLite.

## Features

- **User Authentication**: JWT-based authentication with secure token storage
- **Role-Based Access Control (RBAC)**: Three roles with granular permissions
  - **Admin**: Full access - manage users, all tasks, and roles
  - **Manager**: View all tasks, assign tasks, manage team tasks
  - **User**: Manage own tasks only
- **Task Management**: Full CRUD operations with filtering
- **User Management**: Admin panel for user creation and role assignment
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "New Task Management"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### Demo Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@admin.com        | admin123   |
| Manager | manager@example.com    | manager123 |
| User    | user@example.com       | user123    |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - Get tasks (filtered by permissions)
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users (Admin/Manager)
- `GET /api/users` - Get all users
- `GET /api/users/roles` - Get all roles
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/role` - Change user role (Admin)

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Auth & permission middleware
│       ├── routes/          # API routes
│       ├── config/          # Database config
│       └── index.ts         # Entry point
│
├── frontend/
│   └── src/
│       ├── components/      # React components
│       ├── contexts/        # Auth context
│       ├── pages/           # Page components
│       ├── services/        # API service
│       └── types/           # TypeScript types
│
└── README.md
```

## Permissions Matrix

| Permission        | Admin | Manager | User |
|-------------------|-------|---------|------|
| users:create      | ✅    | ❌      | ❌   |
| users:read        | ✅    | ✅      | ❌   |
| users:update      | ✅    | ❌      | ❌   |
| users:delete      | ✅    | ❌      | ❌   |
| tasks:create      | ✅    | ✅      | ✅   |
| tasks:read:all    | ✅    | ✅      | ❌   |
| tasks:read:own    | ✅    | ✅      | ✅   |
| tasks:update:all  | ✅    | ✅      | ❌   |
| tasks:update:own  | ✅    | ✅      | ✅   |
| tasks:delete:all  | ✅    | ❌      | ❌   |
| tasks:delete:own  | ✅    | ✅      | ✅   |
| tasks:assign      | ✅    | ✅      | ❌   |
| roles:manage      | ✅    | ❌      | ❌   |

## Deployment

### Frontend (Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variable: `VITE_API_URL` to your backend URL

### Backend
1. Deploy to a Node.js hosting service (Railway, Render, etc.)
2. Set environment variables:
   - `DATABASE_URL`: Database connection string
   - `JWT_SECRET`: Secure secret key
   - `PORT`: Server port

## License

MIT
