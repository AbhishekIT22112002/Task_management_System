# TaskFlow AI - Project & Task Management System


A full-stack MERN (MongoDB, Express.js, React, Node.js) project and task management system with AI-powered assistance using Google's Gemini AI. Features include JWT authentication, drag-and-drop Kanban boards, and intelligent task summarization.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Gemini AI** - AI-powered task assistance

### Frontend
- **React.js** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **SCSS** - Styling
- **Vite** - Build tool

---

## 📋 Features

- ✅ User authentication (register/login with JWT)
- ✅ Create, read, update, and delete projects
- ✅ Organize tasks into columns (To Do, In Progress, Done, etc.)
- ✅ Drag-and-drop Kanban board interface
- ✅ AI-powered task summarization (Gemini AI)
- ✅ Question & Answer about tasks
- ✅ Responsive UI with modern design
- ✅ Request logging and monitoring
- ✅ Secure CORS configuration

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **npm** or **yarn**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/AbhishekIT22112002/Task_management_System.git
cd Task_management_System
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Environment File
Create a `.env` file in the `backend` directory with the following content:

```env
MONGODB_URI=your_mongodb_connection_string_here
PORT=4000
JWT_SECRET=change_this_secret
LOG_LEVEL=info
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

**Environment Variables Explained:**
- `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/task_management_db` for local or MongoDB Atlas connection string)
- `PORT`: Backend server port (default: 4000)
- `JWT_SECRET`: Secret key for JWT token generation (use a strong random string)
- `LOG_LEVEL`: Logging level (`info`, `debug`, `error`, etc.)
- `GEMINI_API_KEY`: Your Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- `GEMINI_MODEL`: **Recommended model is `gemini-2.5-flash`** (other models may not work)

#### 2.3 Install Backend Dependencies
```bash
npm install
```

#### 2.4 Keep Backend Ready (Don't Start Yet)
We'll start the backend after the frontend is built.

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 3.2 Create Environment File
Create a `.env` file in the `frontend` directory with the following content:

```env
VITE_API_BASE=/api
```

**⚠️ IMPORTANT:** Do NOT change the `VITE_API_BASE` value. It must be `/api` exactly as shown above. This ensures the frontend makes API calls to the backend through the same origin.

#### 3.3 Install Frontend Dependencies
```bash
npm install
```

#### 3.4 Build the Frontend
```bash
npm run build
```

This will create a `dist` folder inside the `frontend` directory with the production-ready build.

**⚠️ IMPORTANT:** Do NOT start the frontend development server (`npm run dev`). We only need to build the frontend. The backend server will serve the frontend build automatically on backend url.

---

### Step 4: Start the Backend Server

#### 4.1 Navigate Back to Backend Directory
```bash
cd ../backend
```

#### 4.2 Start the Development Server
```bash
npm run dev
```

The backend server will:
- Start on `http://localhost:4000`
- **Automatically serve the frontend build** from the `frontend/dist` folder
- Connect to MongoDB
- Log all API requests

**✅ Access the Application:**
Open your browser and navigate to:
```
http://localhost:4000
```

**🎯 Important Notes:**
- ✅ **Only the backend server runs** - no need to start a separate frontend server
- ✅ The backend serves both the API (at `/api/*`) and the frontend static files
- ✅ All requests go to `http://localhost:4000` - frontend and backend on the same URL

---

## 📂 Project Structure

```
Task_management_System/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, logging middleware
│   ├── models/          # Mongoose schemas (User, Project, Column, Task)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Logger utility
│   ├── .env.example     # Example environment file
│   ├── index.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── slices/      # Redux slices
│   │   ├── styles/      # SCSS modules
│   │   ├── App.jsx      # Main app component
│   │   ├── main.jsx     # Entry point
│   │   └── store.js     # Redux store
│   ├── .env.example     # Example environment file
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (protected)
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/:id/board` - Get project board with columns and tasks
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Columns
- `POST /api/columns` - Create column
- `GET /api/columns/project/:projectId` - List columns by project
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/column/:columnId` - List tasks by column
- `GET /api/tasks/project/:projectId` - List tasks by project
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🌐 Deployment

### Deployment Summary

The application is deployed on **AWS Lightsail** (Linux instance) with the following setup:

#### Infrastructure
- **Hosting**: AWS Lightsail (Ubuntu/Linux instance)
- **Domain**: Configured via GoDaddy with an A record pointing to the Lightsail server IP
- **Web Server**: Nginx (reverse proxy)
- **SSL Certificate**: Let's Encrypt (via Certbot)
- **Process Manager**: PM2 (for monitoring and auto-restart)

#### Deployment Architecture
1. **Frontend**: Built and served as static files from `backend` (backend serves frontend from `dist` folder)
2. **Backend**: Node.js Express server running on port 4000
3. **Nginx**: Reverse proxy forwarding requests from port 80/443 to port 4000
4. **SSL**: HTTPS enabled using Certbot for the domain `taskflowai.abhidev.xyz`
5. **PM2**: Manages the Node.js process with auto-restart on failure

#### Nginx Configuration (Production)
```nginx
server {
    listen 80;
    server_name taskflowai.abhidev.xyz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name taskflowai.abhidev.xyz;

    ssl_certificate /etc/letsencrypt/live/taskflowai.abhidev.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/taskflowai.abhidev.xyz/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### PM2 Process Management
```bash
# Start the backend with PM2
pm2 start backend/index.js --name taskflow-backend

# Monitor processes
pm2 monit

# View logs
pm2 logs taskflow-backend

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## 🧪 Testing

### Register a New User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Create a Project (with token)
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"My Project","description":"First project"}'
```

---

## 📝 Notes

- **MongoDB**: Ensure MongoDB is running locally or use MongoDB Atlas for cloud hosting
- **Gemini API**: Sign up at [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key
- **CORS**: Backend is configured to only accept requests from `localhost:3000` during development and same-origin in production
- **Frontend Build**: The backend serves the frontend build, so you don't need to run a separate frontend server in production
- **Logging**: All API requests are logged with Winston (check console for logs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Abhishek**
- GitHub: [@AbhishekIT22112002](https://github.com/AbhishekIT22112002)

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent task assistance
- MongoDB for the database
- React and Redux for the frontend framework
- Express.js for the backend framework
- AWS Lightsail for hosting

---

**Built with ❤️ using the MERN stack**
