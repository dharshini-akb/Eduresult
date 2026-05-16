# Student Result Management System (MERN Stack)

A modern, responsive, and feature-rich Student Result Management System built with MongoDB, Express.js, React.js, and Node.js.

## Features

### 🔐 Authentication & Roles
- **JWT Authentication**: Secure login with role-based access control.
- **Admin**: Manage teachers, students, subjects, and view global statistics.
- **Teacher**: Enter marks, manage student lists, and publish results.
- **Student**: View personalized results, performance charts, and download marksheets.

### 📊 Modern UI/UX
- **Glassmorphism Design**: Clean, modern, and professional interface.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Charts & Analytics**: Visual data representation using Recharts.
- **Animations**: Smooth transitions with Framer Motion.

### 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS 4, Framer Motion, Recharts.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.

---

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed (or use MongoDB Atlas)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd resultmanagement
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env file (already created with defaults)
   # Seed dummy data
   npm run seed
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Start the development server
   npm run dev
   ```

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | password123 |
| Teacher | teacher@test.com | password123 |
| Student | student@test.com | password123 |

---

## Project Structure
```
/backend
  /config      - Database connection
  /controllers - API logic
  /models      - Mongoose schemas
  /routes      - API endpoints
  /middleware  - Auth & Error handlers
/frontend
  /src/components - Reusable UI components
  /src/context    - Auth state management
  /src/pages      - Dashboard and landing pages
  /src/assets     - Images and icons
```

## Advanced Features Implemented
- [x] Automatic GPA & Grade calculation
- [x] Role-based protected routes
- [x] Performance analytics charts
- [x] Seed script for easy testing
- [x] Modern Glassmorphism UI
- [x] PDF Marksheet download (Ready for frontend integration)
