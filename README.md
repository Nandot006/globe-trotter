# Globe Trotter - Travel Planning Application

A modern travel planning application with user authentication and SQL database storage.

## Features

- **Login Page**: Secure login with email and password, displays user profile picture
- **Signup Page**: User registration with profile picture upload
- **SQL Database**: SQLite database to store user information
- **Profile Pictures**: Users can upload profile pictures that are displayed on login
- **Form Validation**: Client-side and server-side validation for all fields
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Development

You need to run both the backend server and frontend development server:

**Option 1: Run both simultaneously**
```bash
npm run dev:full
```

**Option 2: Run separately (in two terminals)**

Terminal 1 - Backend server:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

- `src/components/Login.tsx` - Login component with profile picture display
- `src/components/Signup.tsx` - Signup component with profile picture upload
- `src/components/Auth.css` - Authentication styles
- `src/App.tsx` - Main app with routing
- `server/index.ts` - Express backend server with API endpoints
- `server/database.ts` - SQLite database setup and schema
- `data/globe_trotter.db` - SQLite database file (created automatically)

## API Endpoints

- `POST /api/signup` - Register a new user
- `POST /api/login` - Authenticate user
- `GET /api/user/:email` - Get user profile picture by email

## Database Schema

The `users` table stores:
- id, first_name, last_name, email, password (hashed)
- phone_number, city, country, description
- profile_picture (base64 encoded)
- created_at timestamp

## Technologies

- **Frontend**: React 18, TypeScript, Vite, React Router DOM
- **Backend**: Express, SQLite (better-sqlite3), bcryptjs
- **Database**: SQLite

