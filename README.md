# AJAT - AI-Powered Job Application Tracker

A modern, full-stack job application tracking system with AI-powered recommendations and insights.

## 🚀 Features

- **AI-Powered Recommendations**: Get personalized job recommendations based on your profile and preferences
- **Application Tracking**: Track your job applications through every stage of the process
- **Resume Management**: Upload, parse, and analyze your resumes with AI insights
- **Interview Scheduling**: Manage interview schedules and preparation notes
- **Analytics & Insights**: Get detailed insights into your job search progress
- **Professional UI**: Modern, responsive design with smooth animations
- **Real-time Updates**: Stay updated with notifications and real-time data

## 🛠 Tech Stack

### Backend
- **Django 5.0+** - Web framework
- **Django REST Framework** - API development
- **MongoDB** - Database (via MongoEngine)
- **JWT Authentication** - Secure authentication
- **OpenAI API** - AI-powered features
- **Redis** - Caching and session management

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Axios** - HTTP client

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB 6.0+**
- **Redis 6.0+** (optional, for caching)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AJAT_starter
```

### 2. Backend Setup

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
- `GET /api/resumes/` - List resumes
- `POST /api/resumes/` - Upload resume
- `GET /api/resumes/{id}/` - Get resume details
- `PUT /api/resumes/{id}/` - Update resume
- `DELETE /api/resumes/{id}/` - Delete resume

### Recommendations
- `GET /api/recommendations/` - Get AI recommendations

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
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Ensure all environment variables are set correctly
3. Verify that MongoDB and Redis are running
4. Check that all dependencies are installed
5. Review the API documentation

## 🔄 Updates

To update the application:

1. Pull the latest changes
2. Update backend dependencies: `pip install -r requirements.txt`
3. Update frontend dependencies: `npm install`
4. Run any new migrations
5. Restart the services

---

**Happy job hunting! 🎯**