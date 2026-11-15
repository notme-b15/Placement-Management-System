# Program 5 – Full Stack Placement Management System
## React + Node.js + Express + MongoDB (Mongoose) – CO6

This project contains a React frontend and an Express REST API. MongoDB Atlas (or a local MongoDB server) stores administrator accounts and placement applications. Mongoose is used to define schemas and communicate with MongoDB.

## 1. Project structure

```text
program5-fullstack/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Application.js
│   │   └── User.js
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   └── authRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── style.css
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vercel.json
```

## 2. Create a MongoDB database using MongoDB Atlas

1. Visit https://www.mongodb.com/cloud/atlas and create/sign in to an account.
2. Create a project, for example `PlacementManagement`.
3. Create a free/shared database deployment if available for your account.
4. Create a database user with a username and password. These are database credentials, not your Atlas login.
5. In **Network Access**, add your current IP address. For a temporary classroom demo only, you can use `0.0.0.0/0`; restrict access for a real deployment.
6. Open your deployment and choose **Connect → Drivers**.
7. Select Node.js and copy the connection string.
8. Replace the username, password and cluster placeholder. The database name in this project is `placement_db`.

Example format (not a real credential):

```text
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.example.mongodb.net/placement_db?retryWrites=true&w=majority
```

If your password contains reserved URL characters, URL-encode those characters before putting the URI in `.env`.

MongoDB creates the `users` and `applications` collections automatically when the first documents are inserted. You do not need to run SQL or create tables manually.

## 3. Configure and run the backend

Open the project folder in VS Code. In a terminal:

```bash
cd backend
npm install
```

Copy `backend/.env.example` to a new file named `backend/.env`. On Windows PowerShell you can run:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set your actual Atlas connection string and a long, private JWT secret:

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/placement_db?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_secret_value
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

Expected terminal messages include:

```text
MongoDB connected: placement_db
Placement API listening on port 5000
```

Open `http://localhost:5000/api/health`. A successful response should show `"status":"ok"` and `"database":"connected"`.

## 4. Configure and run the React frontend

Open a second VS Code terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

The local frontend environment variable should be:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

Register an administrator account, log in, and use the dashboard to add, search, sort, update and delete placement applications. The React UI is retained from the supplied project.

## 5. API endpoints

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/health` | Check API and database status | No |
| POST | `/api/auth/register` | Register administrator | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/applications` | List applications | No (classroom demo) |
| POST | `/api/applications` | Create an application | Bearer JWT |
| PUT | `/api/applications/:id` | Update application status | Bearer JWT |
| DELETE | `/api/applications/:id` | Delete an application | Bearer JWT |

For protected routes, send the token in the HTTP header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## 6. Verify MongoDB records

1. Sign in to MongoDB Atlas.
2. Open your database deployment and select **Browse Collections**.
3. Open the `placement_db` database.
4. After registering, inspect the `users` collection.
5. After adding an application, inspect the `applications` collection.

Passwords are hashed with bcrypt before storage. The API does not return password hashes to the frontend.

## 7. Deployment

### Render – backend

1. Push the project to GitHub. Ensure `.env` is not committed.
2. Create a Web Service in https://render.com and connect the repository.
3. Set the Root Directory to `program5-fullstack/backend` if the repository contains the parent folder.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Add these environment variables in Render:
   - `MONGO_URI` – your MongoDB Atlas connection string.
   - `JWT_SECRET` – a long random secret.
   - `CLIENT_URL` – your deployed Vercel frontend URL.
   - `NODE_ENV` – `production`.
7. Deploy and test `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

In MongoDB Atlas Network Access, allow the outbound IP addresses required by your Render service. If your Render plan does not provide stable outbound IPs, consult its current networking guidance. Do not assume that allowing only your home IP will permit Render to connect.

### Vercel – frontend

1. Import the GitHub repository into https://vercel.com.
2. Set Root Directory to `program5-fullstack/frontend`.
3. Select the Vite framework preset.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add `VITE_API_URL` with the deployed Render backend URL, for example `https://YOUR-RENDER-SERVICE.onrender.com`.
7. Deploy.
8. Set Render's `CLIENT_URL` to the final Vercel URL and redeploy the backend if necessary.

The included `vercel.json` rewrite supports React Router deep links. Never put MongoDB credentials or JWT secrets in frontend environment variables. Variables prefixed with `VITE_` are exposed to browser code.

## 8. Concepts demonstrated

- React functional components, JSX, props, state, effects and React Router.
- Node.js and Express server.
- REST API using GET, POST, PUT and DELETE.
- MongoDB collections and documents.
- Mongoose schemas, models, validation and CRUD operations.
- Password hashing using bcrypt.
- JWT-based authentication middleware.
- CORS, environment variables, request logging and centralized error handling.

## 9. Important classroom-demo security note

The GET applications route is intentionally public to preserve the supplied classroom demonstration. Create, update and delete routes require a JWT. For a production system, require authentication for reading records too, enforce role-based access control, and ensure users can only access records they are authorized to manage. Restrict administrator registration rather than allowing unrestricted public admin-account creation.

