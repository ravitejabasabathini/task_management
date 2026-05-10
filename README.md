# Ethara Project Manager (MERN)

Simple MERN stack project management app with role-based access, authentication, task assignment, and progress tracking.

## Features
- Signup / Login with JWT authentication
- Admin / Member role-based access control
- Projects with members
- Tasks that can be created, assigned, and status-tracked
- Dashboard summary for task status and overdue tasks
- REST API backend with MongoDB

## Setup

### Backend
1. Open `backend`
2. Copy `.env.example` to `.env`
3. Fill in `MONGO_URI` and `JWT_SECRET`
4. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
5. Start server:
   ```bash
   npm run dev
   ```

### Frontend
1. Open `frontend`
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start React app:
   ```bash
   npm start
   ```

## Deployment
### One-service deployment on Railway
This repo is ready to deploy as a single service if the backend serves the frontend build.

1. In Railway, create a new project and connect the repo.
2. Use the `backend` directory as the service root.
3. Set the build command to:
   ```bash
   npm install
   npm run heroku-postbuild
   ```
4. Set the start command to:
   ```bash
   npm start
   ```
5. Add Railway environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (optional, Railway provides a port automatically)
6. Railway will build the frontend and then start the backend.

The frontend will be served from the backend in production, and API calls will use `/api` by default.

### Separate frontend deployment option
If you prefer hosting frontend separately (for example on Vercel):
- Deploy the `frontend` app as a static React site.
- Set `REACT_APP_API_URL` to your backend URL.

## Notes
- Admin can create projects and tasks.
- Member can view tasks and update status for assigned tasks.
