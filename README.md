# 📚 LearnPath - Learning Management System

A comprehensive full-stack learning management system with role-based authentication for Students and Instructors, built with React.js, Node.js, Express.js, and MongoDB.

![LearnPath Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=LearnPath+Dashboard)

## 🌟 Features

### 🔐 Authentication System
- **Multi-Role Registration**: Separate registration for Students and Instructors
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions and features for each role
- **Password Security**: Bcrypt password hashing and validation
- **Account Management**: Profile updates, password changes, account deactivation

### 👨‍🎓 Student Features
- **Learning Paths**: Personalized learning journey tracking
- **Progress Analytics**: Visual progress tracking and statistics
- **Achievements System**: Gamified learning with badges and rewards
- **Resource Management**: Access to PDFs, videos, links, and notes
- **Course Enrollment**: Browse and enroll in available courses

### 👨‍🏫 Instructor Features
- **Course Management**: Create, edit, and manage courses
- **Student Analytics**: Track student progress and performance
- **Content Creation**: Upload and organize course materials
- **Assignment & Grading**: Create assignments and grade submissions
- **Dashboard Insights**: Comprehensive teaching analytics

### 🎨 UI/UX Features
- **Modern Design**: Gradient-based, responsive design
- **Dynamic Navigation**: Role-specific navigation menus
- **Real-time Updates**: Live data updates throughout the interface
- **Mobile Responsive**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with Hooks
- **Context API** - State management for authentication
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcryptjs** - Password hashing

### Development Tools
- **VS Code** - Code editor
- **Git** - Version control
- **npm** - Package manager
- **Nodemon** - Development server

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/mustaque01/majorproject01.git
cd majorproject01
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd Backend
npm install
```


### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# Seed the database with sample data (optional)
cd Backend
node seedDatabase.js
```

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 🚀 Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
```bash
cd Backend
node app.js
```
Server runs on: `http://localhost:5000`

#### Terminal 2: Start Frontend Server
```bash
npm start
```
Frontend runs on: `http://localhost:3000`

### Production Mode
```bash
# Build frontend
npm run build

# Start production server
cd Backend
NODE_ENV=production node app.js
```

## 📱 Usage

### 1. Registration
1. Navigate to `http://localhost:3000`
2. Click **"Sign Up"**
3. Choose your role: **Student** or **Instructor**
4. Fill in your details:
   - First Name, Last Name
   - Email address
   - Secure password
   - Additional role-specific information
5. Click **"Create Account"**

### 2. Login
1. Click **"Sign In"**
2. Enter your credentials:
   - Email
   - Password
   - Select your role
3. Click **"Sign In"**

### 3. Dashboard Features

#### Student Dashboard
- **Learning Paths**: View and manage your learning journey
- **Progress Tracking**: Monitor your course completion
- **Resources**: Access study materials and documents
- **Achievements**: Track your learning milestones

#### Instructor Dashboard
- **Course Management**: Create and manage your courses
- **Student Analytics**: Monitor student progress
- **Content Upload**: Add course materials and assignments
- **Grading Tools**: Evaluate and grade student work

## 🔧 API Endpoints

### Authentication Routes
```http
POST /api/auth/register          # Register new user
POST /api/auth/login            # Login user
POST /api/auth/logout           # Logout user
GET  /api/auth/me              # Get current user profile
PUT  /api/auth/me              # Update user profile
PUT  /api/auth/change-password  # Change password
DELETE /api/auth/me            # Deactivate account
```

### Course Routes
```http
GET  /api/categories           # Get all categories
GET  /api/categories/:id       # Get category by ID
GET  /api/categories/:id/courses # Get courses by category
GET  /api/categories/courses/all # Get all courses
```

### Dashboard Routes
```http
GET  /api/dashboard           # Get personalized dashboard (protected)
```

## 📁 Project Structure

```
majorproject01/
├── public/                   # Public assets
├── src/                     # React frontend source
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── Header.js       # Navigation header
│   │   └── Sidebar.js      # Navigation sidebar
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.js  # Authentication context
│   ├── App.js             # Main App component
│   └── index.js           # React entry point
├── Backend/                # Backend server
│   ├── models/            # Database models
│   ├── Routes/            # API routes
│   ├── data/              # Sample data
│   └── app.js             # Express server
├── server/                # Authentication server
│   ├── models/            # User models
│   │   ├── Student.js     # Student model
│   │   └── Instructor.js  # Instructor model
│   ├── routes/            # Auth routes
│   │   └── auth.js        # Authentication endpoints
│   └── middleware/        # Custom middleware
│       └── auth.js        # JWT middleware
└── README.md             # Project documentation
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Content sanitization

## 🎯 Demo Accounts

For testing purposes, you can create accounts with these sample credentials:

### Student Account
- **Email**: `student@demo.com`
- **Password**: `123456`
- **Role**: Student

### Instructor Account
- **Email**: `instructor@demo.com`
- **Password**: `123456`
- **Role**: Instructor

> **Note**: Create these accounts through the registration process

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
Error: MongooseError: Operation buffering timed out
```
**Solution**: Ensure MongoDB is running locally or check your Atlas connection string.

#### 2. Port Already in Use
```bash
Error: Something is already running on port 3000
```
**Solution**: Kill the process or use a different port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <process-id>

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### 3. JWT Token Issues
```bash
Error: Invalid token
```
**Solution**: Clear browser localStorage and login again:
```javascript
localStorage.clear()
```

#### 4. CORS Errors
```bash
Access to fetch blocked by CORS policy
```
**Solution**: Ensure backend CORS is properly configured for frontend URL.

## 🔄 Development Workflow

### Adding New Features
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Develop Feature**
   - Frontend: Add components in `src/components/`
   - Backend: Add routes in `Backend/Routes/`
   - Database: Add models in `server/models/`

3. **Test Feature**
   - Test authentication flows
   - Verify role-based access
   - Check responsive design

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add: new feature description"
   git push origin feature/new-feature-name
   ```

### Code Standards
- **ES6+** syntax for JavaScript
- **Functional Components** with Hooks for React
- **Async/Await** for asynchronous operations
- **Consistent naming** conventions
- **Error handling** for all API calls

## 📈 Future Enhancements

### Planned Features
- [ ] **Real-time Chat**: Student-instructor messaging
- [ ] **Video Conferencing**: Integrated video calls
- [ ] **Advanced Analytics**: Detailed progress insights
- [ ] **Mobile App**: React Native mobile application
- [ ] **Payment Integration**: Course purchase system
- [ ] **Certification System**: Digital certificates
- [ ] **AI Recommendations**: Personalized course suggestions
- [ ] **Offline Mode**: Progressive Web App features

### Technical Improvements
- [ ] **Redis Caching**: Performance optimization
- [ ] **Docker Support**: Containerization
- [ ] **CI/CD Pipeline**: Automated deployment
- [ ] **Testing Suite**: Unit and integration tests
- [ ] **API Documentation**: Swagger/OpenAPI
- [ ] **Monitoring**: Error tracking and analytics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add: amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Developer
- **Mustaque** - Full Stack Developer
  - GitHub: [@mustaque01](https://github.com/mustaque01)
  - Email: [mustaque@example.com](mailto:mustaque@example.com)

### Acknowledgments
- **React Team** - For the amazing frontend framework
- **Express.js** - For the robust backend framework
- **MongoDB** - For the flexible database solution
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

### Getting Help
- **GitHub Issues**: [Create an issue](https://github.com/mustaque01/majorproject01/issues)
- **Email Support**: mustaque@example.com
- **Documentation**: Check this README and inline code comments

### FAQ

**Q: Can I use this for commercial projects?**
A: Yes, this project is open source under MIT license.

**Q: How do I add new user roles?**
A: Extend the User models and update the authentication middleware.

**Q: Is this production ready?**
A: This is a demonstration project. Additional security and performance optimizations are recommended for production use.

---

<div align="center">

**🌟 If this project helped you, please give it a star! 🌟**
</div>