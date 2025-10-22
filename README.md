# AJAT - AI-Powered Job Application Tracker

A modern, full-stack job application tracking system with AI-powered recommendations and insights. Built with performance, accessibility, and developer experience in mind.

## 🚀 Features

### Core Features
- **AI-Powered Job Matching**: Advanced algorithm matches your skills with job requirements
- **Resume Parser**: Extract skills and experience from PDF/DOCX resumes using AI
- **Application Tracking**: Comprehensive tracking through all job application stages
- **Skill Gap Analysis**: Identify missing skills for your target roles
- **Interview Preparation**: Track interview questions and company research

### Enhanced UX
- **Dark/Light Mode**: Beautiful, accessible themes with system preference detection
- **Responsive Design**: Works on all devices from mobile to desktop
- **Real-time Updates**: Instant feedback and data synchronization
- **Keyboard Navigation**: Full keyboard accessibility
- **Performance Optimized**: Fast loading with code splitting and lazy loading

## 🛠 Tech Stack

### Backend (Django)
- **Django 5.0+** - High-level Python Web framework
- **Django REST Framework** - Powerful API toolkit
- **MongoDB (MongoEngine)** - Application data store; SQLite is used internally by Django for admin/auth
- **JWT Authentication** - Secure token-based auth
- **OpenAI API** - AI-powered parsing and recommendations
- **Redis (optional)** - Caching

### Frontend (React + TypeScript)
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS 3.0+** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful, accessible components
- **Framer Motion** - Smooth animations and transitions
- **TanStack Query v5** - Powerful data synchronization
- **React Hook Form** - Performant form management
- **Vite** - Next-generation frontend tooling
- **ESLint + Prettier** - Code quality and formatting

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB 6.0+** (or MongoDB Atlas)
- **Redis 7.0+** (optional)
- **Git**

## 🚀 Quick Start

### Using start.sh Script (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ajat.git
   cd ajat
   ```

2. Make the script executable and run:
   ```bash
   chmod +x start.sh
   ./start.sh --init-db
   ```
   This will:
   - Check ports and start both backend and frontend servers
   - Optionally initialize seed data when using `--init-db`
   - Note: It expects `backend/.venv` and `frontend/node_modules` to already exist. If missing, follow Manual Setup below first.

3. Access the application at `http://localhost:5173`

### Manual Setup

#### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ajat_db
MONGODB_NAME=ajat_db

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
# Install Playwright
npx playwright install

# Run tests
npx playwright test
```

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env file with your configuration
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
```

### 4. Database Setup

#### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create collections on first run

#### Redis Setup (Optional)
1. Install Redis locally or use a cloud service
2. Update the `REDIS_URL` in your `.env` file

### 5. Environment Configuration

Update the `.env` file in the root directory with your specific values:

```env
# Django Configuration
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ajat_db
MONGODB_NAME=ajat_db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-this
JWT_ACCESS_TOKEN_LIFETIME=30
JWT_REFRESH_TOKEN_LIFETIME=1440

# AI/ML Configuration
OPENAI_API_KEY=your-openai-api-key-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend**:
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
python manage.py runserver
```

2. **Start the Frontend**:
```bash
cd frontend
npm run dev
```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/me/` - Get current user
- `PUT /api/auth/me/` - Update user profile

### Jobs
- `GET /api/jobs/` - List jobs
- `GET /api/jobs/{id}/` - Get job details
- `GET /api/jobs/search/` - Search jobs

### Applications
- `GET /api/applications/` - List applications
- `POST /api/applications/` - Create application
- `GET /api/applications/{id}/` - Get application details
- `PUT /api/applications/{id}/` - Update application
- `DELETE /api/applications/{id}/` - Delete application

### Resumes
- `GET /api/resumes/list/` - List resumes (current user)
- `POST /api/resumes/upload/` - Upload a PDF/DOCX; server extracts text and stores it
- `POST /api/resumes/text/` - Save pasted resume text
- `POST /api/resumes/extract-skills/` - Extract skills (uses OpenAI if configured; falls back to keyword matching)
- `POST /api/resumes/parse/` - AI parse into structured JSON (summary, skills, experience, education)

### Recommendations
- `POST /api/recommendations/refresh/` - Generate AI job recommendations based on your latest resume

### Insights
- `GET /api/insights/dashboard/` - Dashboard analytics
- `GET /api/insights/applications/` - Application statistics

## 🔑 Required API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

### HuggingFace API Key (Optional)
1. Go to https://huggingface.co/settings/tokens
2. Create a new token
3. Add it to your `.env` file as `HUGGINGFACE_API_KEY`

## 🎨 Customization

### Styling
- Modify `frontend/tailwind.config.js` for theme customization
- Update `frontend/src/index.css` for global styles
- Component styles are in individual component files

### AI Features
- Customize AI prompts in `backend/recommender/ai_service.py`
- Modify recommendation algorithms in `backend/recommender/views.py`

## 📱 Features Overview

### Dashboard
- Application statistics
- Recent applications
- AI recommendations
- Quick actions

### Job Tracking
- Add new applications
- Update application status
- Schedule interviews
- Add notes and documents

### AI Recommendations
- Personalized job matches
- Skill gap analysis
- Salary insights
- Market trends

### Resume Management
- Upload multiple resumes
- AI-powered parsing
- Skill extraction
- Resume scoring

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in production
2. Configure proper database settings
3. Set up static file serving
4. Configure CORS settings
5. Use environment variables for secrets

### Frontend Deployment
1. Build the production bundle:
```bash
npm run build
```
2. Build output is emitted to `backend/static/` (see `frontend/vite.config.ts`). Ensure your Django app is configured to serve static files in production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility-first CSS framework
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful, accessible components
- [TanStack Query](https://tanstack.com/query) for server state management
- [Vite](https://vitejs.dev/) for the lightning-fast development experience

## 🤔 Troubleshooting

If you encounter any issues:

1. Check the console for error messages
2. Ensure all environment variables are set correctly
3. Verify that MongoDB and Redis are running
4. Check that all dependencies are installed

## 🔄 Updates

To update the application:

1. Pull the latest changes
2. Update backend dependencies: `pip install -r requirements.txt`
3. Update frontend dependencies: `npm install`
4. Run any new migrations
5. Restart the services

---

**Happy job hunting! 🎯**