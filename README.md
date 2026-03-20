# School Management System

A comprehensive, multi-tenant school management system designed for government primary schools in Sindh, Pakistan. Built with modern web technologies to streamline student administration, record-keeping, and document generation.

## 🌟 Features

### Student Management
- **Student Admission**: Complete admission form with detailed student information
- **Student Records**: Maintain comprehensive student profiles with personal, academic, and contact details
- **Student Search**: Search students by name, father's name, GR number, or class
- **Student Updates**: Edit and update student information
- **Student Status Tracking**: Track active, left, and transferred students
- **Batch Upload**: Support for offline bulk student enrollment

### Class Management
- **Class Creation**: Create and manage multiple classes
- **Class Assignment**: Assign students to appropriate classes
- **Class-wise Filtering**: View students by class

### Results & Grades
- **Grade Entry**: Add and manage student marks for different subjects
- **Subject Management**: Create and manage subjects for each class
- **Marksheet Generation**: Generate comprehensive student marksheets
- **Result Reports**: View and export student results

### Document Generation
- **Admission Forms**: Generate and print admission forms in PDF format
- **GR (General Register)**: Generate complete GR register or individual student GR
- **Leaving Certificates**: Create and print school leaving certificates
- **Automated PDF Generation**: All documents generated with proper formatting and school branding

### School Administration
- **School Onboarding**: Easy school registration with SEMIS code
- **School Profile**: Manage school information and logo
- **Multi-tenant Architecture**: Each school has isolated data
- **Dashboard**: Overview of school statistics and quick actions

### AI Assistant
- **Intelligent Chatbot**: AI-powered assistant using Google Gemini 2.5 Flash
- **Context-Aware**: Understands school context and provides relevant guidance
- **Multi-lingual Support**: Responds in Sindhi, Urdu, or English
- **Feature Guidance**: Helps users navigate and use system features

### Authentication & Security
- **Email/Password Authentication**: Secure user registration and login
- **Google OAuth**: Sign in with Google account
- **JWT Tokens**: Secure API authentication
- **Password Reset**: Email-based password recovery
- **Protected Routes**: Role-based access control

### User Experience
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **RTL Support**: Right-to-left text support for Sindhi and Urdu
- **Multi-language Interface**: Sindhi, Urdu, and English support
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Prevent accidental data deletion

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **PDF Generation**: Puppeteer

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with python-jose
- **Password Hashing**: Passlib with bcrypt
- **Email**: SMTP (Gmail)
- **AI**: Google Generative AI (Gemini 2.5 Flash)

### DevOps & Tools
- **Package Manager**: npm (frontend), uv (backend)
- **Version Control**: Git
- **Environment Variables**: dotenv

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.13+
- PostgreSQL database
- Google OAuth credentials (optional)
- Google Gemini API key (for AI chatbot)
- SMTP credentials (for email features)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gbps-ahmd.git
cd gbps-ahmd
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies using uv
uv sync

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://user:password@host:port/database
# SECRET_KEY=your-secret-key
# GOOGLE_CLIENT_ID=your-google-client-id
# FRONTEND_URL=http://localhost:3000
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# FROM_EMAIL=your-email@gmail.com
# GEMINI_API_KEY=your-gemini-api-key

# Run the backend server
uv run uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Run the development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
gbps-ahmd/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── admission/   # Student admission
│   │   │   ├── students/    # Student list
│   │   │   ├── results/     # Results management
│   │   │   ├── leaving-certificate/  # Leaving certificates
│   │   │   ├── dashboard/   # Dashboard
│   │   │   └── api/         # API routes (PDF generation)
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utilities and API client
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── main.py             # Main application entry
│   ├── models.py           # Database models
│   ├── schema/             # Pydantic schemas
│   ├── database.py         # Database configuration
│   ├── auth.py             # Authentication logic
│   ├── password_reset.py   # Password reset functionality
│   ├── uploads/            # Uploaded files (logos, images)
│   └── pyproject.toml      # Python dependencies
│
└── README.md               # This file
```

## 🔑 Key Features Breakdown

### Multi-tenant Architecture
Each school operates independently with isolated data. Schools are identified by SEMIS code and all data operations are scoped to the authenticated user's school.

### Document Generation Pipeline
1. User requests document (admission form, GR, leaving certificate)
2. Frontend API route fetches data from backend
3. Puppeteer generates PDF from HTML template
4. PDF is downloaded to user's device

### AI Chatbot Integration
- Uses Google Gemini 2.5 Flash model
- Maintains conversation history
- Provides school-specific context (statistics, student count, etc.)
- Guides users through system features
- Supports multi-lingual responses

### Responsive Design Strategy
- Desktop: Full table views with all columns
- Tablet: Optimized grid layouts (2 columns)
- Mobile: Card-based layouts for better readability
- Modals: Responsive sizing with proper scrolling

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_URL=http://localhost:3000
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📱 Usage

### First Time Setup
1. Register a new account
2. Onboard your school with SEMIS code
3. Create classes (automatically created for government primary schools)
4. Start adding students

### Daily Operations
1. **Add New Students**: Navigate to Admission page
2. **View Students**: Go to Students page, filter by class or search
3. **Add Results**: Use Results page to enter marks
4. **Generate Documents**: Click respective buttons to download PDFs
5. **Issue Leaving Certificates**: Create certificate when student leaves

### Using AI Assistant
1. Click the floating chat button
2. Ask questions in Sindhi, Urdu, or English
3. Get guidance on features, navigation, and tasks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Ghulam Akbar** - Initial work

## 🙏 Acknowledgments

- Built for government primary schools in Sindh, Pakistan
- Designed to digitize traditional paper-based record-keeping
- Supports Sindhi language and local educational requirements

## 📞 Support

For support, email akbarghulam47@gmail.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Attendance tracking system
- [ ] Fee management module
- [ ] SMS notifications for parents
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reports
- [ ] Teacher management module
- [ ] Exam scheduling and management
- [ ] Parent portal

## 📸 Screenshots

_Add screenshots of your application here_

---

**Note**: This system is specifically designed for government primary schools in Sindh, Pakistan, following local educational standards and requirements.