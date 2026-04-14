# Instructor Backend Testing Guide

## Quick Start

### 1. Server Setup
```bash
cd Backend
npm start
```

Server will start on `http://localhost:5000`

### 2. Test Data Setup
```bash
node scripts/seedDatabase.js
```

This creates:
- 5 Instructors
- 12 Categories
- 8 Sample Courses
- Test User Accounts

---

## Testing Workflow

### Phase 1: Authentication

#### Register as Instructor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@instructor.com",
    "password": "password123",
    "role": "instructor",
    "specialization": "Web Development",
    "institution": "Tech University"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Instructor account registered successfully. Your profile is ready to create courses!",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@instructor.com",
      "role": "instructor",
      "instructorId": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save the accessToken for next requests!**

---

#### Login as Instructor
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@instructor.com",
    "password": "password123",
    "role": "instructor"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@instructor.com",
      "role": "instructor",
      "instructorId": "...",
      "instructorProfile": {
        "specialization": "Web Development",
        "yearsOfExperience": 0,
        "totalStudents": 0,
        "coursesCreated": 0
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Phase 2: Instructor Profile

#### Get My Profile
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..." # Use your accessToken

curl -X GET http://localhost:5000/api/instructor/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@instructor.com",
      "specialization": "Web Development",
      "yearsOfExperience": 0,
      "skills": [],
      "certifications": [],
      "bio": "",
      "totalStudents": 0,
      "averageRating": 0,
      "coursesCreated": 0,
      "isVerified": false,
      "isActive": true
    },
    "courses": [],
    "statistics": {
      "totalCourses": 0,
      "activeCourses": 0,
      "draftCourses": 0,
      "totalStudents": 0,
      "averageRating": 0,
      "yearsOfExperience": 0
    }
  }
}
```

---

#### Update My Profile
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X PUT http://localhost:5000/api/instructor/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Expert in React and Node.js development",
    "yearsOfExperience": 5,
    "skills": ["React", "Node.js", "MongoDB", "Express"],
    "certifications": ["AWS Developer Associate"],
    "socialLinks": {
      "twitter": "https://twitter.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Instructor profile updated successfully",
  "data": {
    ...updated profile data...
  }
}
```

---

### Phase 3: Course Management

#### Create New Course
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST http://localhost:5000/api/instructor/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete React Mastery",
    "description": "Learn React from scratch to advanced level",
    "categoryId": "507f1f77bcf86cd799439001",
    "duration": "42.5 hours",
    "level": "Intermediate",
    "price": 99.99,
    "topics": ["React Basics", "Hooks", "State Management", "Routing"],
    "skills": ["React", "JavaScript", "Web Development"],
    "requirements": ["Basic JavaScript knowledge"],
    "difficulty": 6,
    "tags": ["react", "frontend", "javascript"],
    "certification": {
      "offered": true,
      "certificateName": "React Developer Certificate"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Course created successfully. It'\''s currently in DRAFT status.",
  "data": {
    "_id": "...",
    "title": "Complete React Mastery",
    "status": "draft",
    "instructorId": "...",
    "categoryId": "..."
  }
}
```

---

#### Get My Courses
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET "http://localhost:5000/api/instructor/courses?status=draft&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Complete React Mastery",
      "level": "Intermediate",
      "price": 99.99,
      "rating": 0,
      "enrolledStudents": 0,
      "status": "draft",
      "duration": "42.5 hours",
      "skills": ["React", "JavaScript", "Web Development"]
    }
  ],
  "pagination": {
    "total": 1,
    "count": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

#### Get Course Details
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X GET http://localhost:5000/api/instructor/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Update Course
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X PUT http://localhost:5000/api/instructor/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete React Mastery 2024",
    "price": 89.99,
    "difficulty": 7,
    "tags": ["react", "frontend", "javascript", "2024"]
  }'
```

---

#### Publish Course (Draft → Active)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X POST http://localhost:5000/api/instructor/courses/$COURSE_ID/publish \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Unpublish Course (Active → Draft)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X POST http://localhost:5000/api/instructor/courses/$COURSE_ID/unpublish \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Delete Course
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X DELETE http://localhost:5000/api/instructor/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Phase 4: Analytics & Dashboard

#### Get Dashboard
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:5000/api/instructor/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "instructor": {
      "_id": "...",
      "name": "John Doe",
      "specialization": "Web Development",
      "yearsOfExperience": 5,
      "isVerified": false
    },
    "statistics": {
      "totalCourses": 1,
      "activeCourses": 1,
      "draftCourses": 0,
      "totalStudents": 0,
      "totalRevenue": 0,
      "averageRating": 0
    },
    "courseBreakdown": {
      "byStatus": {
        "active": 1,
        "draft": 0
      },
      "byLevel": {
        "Beginner": 0,
        "Intermediate": 1,
        "Advanced": 0
      }
    },
    "topCourses": [...],
    "coursesByCategory": {...},
    "recentActivity": {
      "coursesCreatedLastMonth": 1,
      "studentsAddedLastMonth": 0
    }
  }
}
```

---

#### Get Course Analytics
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
COURSE_ID="..."

curl -X GET http://localhost:5000/api/instructor/courses/$COURSE_ID/analytics \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Get Performance Summary
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:5000/api/instructor/performance-summary \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Get Earnings Report
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Monthly (default)
curl -X GET http://localhost:5000/api/instructor/earnings?period=monthly \
  -H "Authorization: Bearer $TOKEN"

# Other periods: daily, weekly, yearly
curl -X GET http://localhost:5000/api/instructor/earnings?period=yearly \
  -H "Authorization: Bearer $TOKEN"
```

---

#### Get Course Reviews
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET "http://localhost:5000/api/instructor/reviews?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Scenarios

### 1. Unauthorized (No Token)
```bash
curl -X GET http://localhost:5000/api/instructor/dashboard
```
**Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

### 2. Invalid Token
```bash
curl -X GET http://localhost:5000/api/instructor/dashboard \
  -H "Authorization: Bearer invalid_token"
```
**Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

---

### 3. Non-Instructor Trying Instructor Endpoints
```bash
# Login as student
TOKEN="student_token..."

curl -X GET http://localhost:5000/api/instructor/dashboard \
  -H "Authorization: Bearer $TOKEN"
```
**Response (403):**
```json
{
  "success": false,
  "message": "This action is only available for instructors"
}
```

---

### 4. Course Not Found
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
INVALID_COURSE_ID="invalid_id"

curl -X GET http://localhost:5000/api/instructor/courses/$INVALID_COURSE_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Response (404):**
```json
{
  "success": false,
  "message": "Course not found"
}
```

---

### 5. Insufficient Permissions
```bash
# Instructor A's token
TOKEN_A="..."
# Course owned by Instructor B
COURSE_B_ID="..."

curl -X PUT http://localhost:5000/api/instructor/courses/$COURSE_B_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated"}'
```
**Response (403):**
```json
{
  "success": false,
  "message": "You do not have permission to modify this course"
}
```

---

## Postman Collection

### Import Template
```json
{
  "info": {
    "name": "Instructor Backend API",
    "version": "2.1.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{accessToken}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/login"
          }
        }
      ]
    }
  ]
}
```

---

## Debugging Tips

1. **Check MongoDB Connection**
   ```bash
   mongo
   > use learnpath-production
   > db.instructors.find().pretty()
   > db.courses.find().pretty()
   ```

2. **Enable Debug Logging**
   ```bash
   DEBUG=* npm start
   ```

3. **Check Token Validity**
   ```bash
   # Decode JWT at jwt.io or:
   node -e "console.log(JSON.stringify(require('jsonwebtoken').decode('YOUR_TOKEN'), null, 2))"
   ```

4. **Clear Database and Reseed**
   ```bash
   # Stop server, then:
   mongo
   > use learnpath-production
   > db.dropDatabase()
   > exit
   
   # Restart server and run:
   node scripts/seedDatabase.js
   ```

---

## Success Checklist

- [ ] Instructor signup works
- [ ] Instructor login returns instructorProfile
- [ ] Can get/update instructor profile
- [ ] Can create courses
- [ ] Can list own courses
- [ ] Can update own course
- [ ] Can publish/unpublish course
- [ ] Can delete course
- [ ] Dashboard returns statistics
- [ ] Course analytics works
- [ ] Performance summary works
- [ ] Earnings report works
- [ ] Reviews endpoint works
- [ ] Permission checks work (can't modify others' courses)
- [ ] Error handling works

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Instructor profile not found" | Run migration: `node Backend/scripts/migrateInstructorProfiles.js` |
| "Connect ECONNREFUSED" | Start MongoDB: `mongod` |
| "Invalid token" | Log in again and use new token |
| CORS errors | Check CORS headers in app.js |
| 404 on endpoints | Verify routes are loaded (check server logs) |

---

**Ready to test? Start with Phase 1!**
