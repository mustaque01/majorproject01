# Quick Reference - API Endpoints & Usage

## 🔑 Quick Start

### 1. Setup
```bash
# Navigate to project root
cd c:\Users\musta\Full Stack Developer\majorproject01

# Add routes to Backend/app.js (see SETUP_GUIDE.md)

# Run seeding
node Backend/scripts/seedDatabase.js

# Start server
npm start
```

### 2. Test Endpoints
```bash
# Base URL: http://localhost:5000

# Get all courses
curl http://localhost:5000/api/courses

# Get all instructors
curl http://localhost:5000/api/instructors

# Get all categories
curl http://localhost:5000/api/categories
```

---

## 📚 Course Endpoints

### List Courses
```
GET /api/courses
Parameters:
  - categoryId: Filter by category
  - instructorId: Filter by instructor
  - level: 'Beginner', 'Intermediate', 'Advanced'
  - minPrice: Minimum price (0-999.99)
  - maxPrice: Maximum price
  - minRating: Minimum rating (0-5)
  - isPopular: true/false
  - trending: true/false
  - search: Search in title, description, topics, skills
  - sortBy: 'createdAt', 'rating', 'price' (default: 'createdAt')
  - sortOrder: 1 (asc) or -1 (desc) (default: -1)
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)

Example:
GET /api/courses?trending=true&level=Intermediate&limit=5
```

### Get Single Course
```
GET /api/courses/:id
Response Includes:
  - All course details
  - Instructor info (name, bio, specialization, email)
  - Category info
  - Prerequisites with course titles
  - Resources
  - Skills and tags
```

### Get Courses by Category
```
GET /api/courses/category/:categoryId
Parameters:
  - page: Page number
  - limit: Items per page
Response:
  - List of courses in category
  - Pagination info
```

### Get Courses by Instructor
```
GET /api/courses/instructor/:instructorId
Response:
  - Instructor basic info
  - All their courses
  - Pagination
```

### Get Trending Courses
```
GET /api/courses/trending
Parameters:
  - limit: Max courses (default: 10)
Response:
  - Top trending courses sorted by rating
```

### Get Popular Courses
```
GET /api/courses/popular
Parameters:
  - limit: Max courses (default: 10)
Response:
  - Most popular courses by enrollment
```

### Get Course Prerequisites
```
GET /api/courses/:courseId/prerequisites
Response:
  - Course ID and title
  - Array of prerequisite courses with IDs and names
```

---

## 👨‍🏫 Instructor Endpoints

### List Instructors
```
GET /api/instructors
Parameters:
  - specialization: Filter by specialization
  - search: Search by name, bio, skills, specialization
  - isVerified: true/false (default: true)
  - sortBy: 'averageRating', 'totalStudents', 'name' (default: 'averageRating')
  - sortOrder: 1 (asc) or -1 (desc) (default: -1)
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)

Example:
GET /api/instructors?specialization=Full-Stack%20Web%20Development&limit=5
```

### Get Single Instructor
```
GET /api/instructors/:id
Response Includes:
  - Instructor profile (name, bio, credentials, skills)
  - All courses taught
  - Statistics (totalStudents, rating, coursesCreated)
  - Social links
```

### Get Top Instructors
```
GET /api/instructors/top/rated
Parameters:
  - limit: Max instructors (default: 10)
Response:
  - Top rated verified instructors
```

### Get Instructor Statistics
```
GET /api/instructors/:id/stats
Response:
  - Name, experience, current rating
  - Total courses, enrollments, computed average rating
  - Individual course data
```

### Get Instructors by Specialization
```
GET /api/instructors/specialization/:specialization
Parameters:
  - page: Page number
  - limit: Items per page
Response:
  - Instructors with matching specialization
  - Sorted by rating (highest first)
```

---

## 📂 Category Endpoints

### List Categories
```
GET /api/categories
Parameters:
  - search: Search by name, description, tags
  - isPopular: true/false
  - trending: true/false
  - sortBy: 'displayOrder', 'totalStudents', 'averageRating' (default: 'displayOrder')
  - sortOrder: 1 (asc) or -1 (desc) (default: 1)
  - page: Page number (default: 1)
  - limit: Items per page (default: 50)

Example:
GET /api/categories?trending=true&limit=10
```

### Get Single Category
```
GET /api/categories/:id
Response Includes:
  - Category details (name, description, icon, color)
  - Visual assets (logo, banner)
  - All courses in category
  - Course count
  - Statistics
```

### Get Trending Categories
```
GET /api/categories/trending/categories
Parameters:
  - limit: Max categories (default: 10)
Response:
  - Categories marked as trending
```

### Get Popular Categories
```
GET /api/categories/popular/categories
Parameters:
  - limit: Max categories (default: 10)
Response:
  - Popularity sorted by total students
```

### Get Category Statistics
```
GET /api/categories/:id/stats
Response:
  - Category name and description
  - Total courses and students
  - Average rating
  - Price range (min, max, average)
  - Difficulty distribution
```

---

## 🔍 Common Query Patterns

### Find Best React Courses
```javascript
GET /api/courses?search=React&minRating=4.5&sortBy=rating&limit=10
```

### Find All Instructors in AI
```javascript
GET /api/instructors?specialization=Data%20Science%20%26%20AI&limit=20
```

### Find Top Courses in Web Dev Category
```javascript
GET /api/courses/category/:webDevCategoryId?sortBy=rating&limit=10
```

### Find Trending Courses by Specific Instructor
```javascript
GET /api/courses/instructor/:instructorId?trending=true
```

### Find Beginner Courses Under $100
```javascript
GET /api/courses?level=Beginner&maxPrice=100&limit=15
```

### Find Courses with Certification
```javascript
GET /api/courses?certification.offered=true  // Manual filtering in frontend
```

---

## 💡 Usage Examples

### JavaScript/React
```javascript
// Fetch trending courses
const getTrendingCourses = async () => {
    const response = await fetch('/api/courses?trending=true&limit=10');
    const data = await response.json();
    return data.data;
};

// Fetch instructor with stats
const getInstructorStats = async (instructorId) => {
    const response = await fetch(`/api/instructors/${instructorId}/stats`);
    const data = await response.json();
    return data.data;
};

// Search courses
const searchCourses = async (searchTerm) => {
    const response = await fetch(
        `/api/courses?search=${encodeURIComponent(searchTerm)}`
    );
    const data = await response.json();
    return data.data;
};
```

### cURL Examples
```bash
# Get trending courses
curl http://localhost:5000/api/courses?trending=true

# Get instructor by ID
curl http://localhost:5000/api/instructors/507f1f77bcf86cd799439011

# Search categories
curl "http://localhost:5000/api/categories?search=web"

# Get category stats
curl http://localhost:5000/api/categories/507f1f77bcf86cd799439012/stats
```

### Postman Collection
```json
{
  "info": {
    "name": "Learning Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Courses",
      "item": [
        {
          "name": "Get All Courses",
          "request": {"method": "GET", "url": {"raw": "{{BASE_URL}}/api/courses", "host": ["{{BASE_URL}}"], "path": ["api", "courses"]}}
        },
        {
          "name": "Get Trending Courses",
          "request": {"method": "GET", "url": {"raw": "{{BASE_URL}}/api/courses?trending=true", "host": ["{{BASE_URL}}"], "path": ["api", "courses"]}}
        }
      ]
    }
  ]
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete React Development",
      "description": "...",
      "_id": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "count": 10,
    "page": 1,
    "pages": 15
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## 🎯 Filter Combinations

### Advanced Filtering Examples

**Find Best Web Dev Courses for Beginners**
```
GET /api/courses?categoryId=<web-dev-id>&level=Beginner&minRating=4&sortBy=rating&limit=20
```

**Find Trending Courses by Top Instructors**
```
GET /api/courses?trending=true&sortBy=rating&page=1&limit=10
```

**Find Affordable Full-Stack Courses**
```
GET /api/courses?search=full%20stack&maxPrice=150&sortBy=price&limit=10
```

**Find Popular Data Science Instructors**
```
GET /api/instructors?specialization=Data%20Science%20%26%20AI&sortBy=totalStudents&limit=10
```

---

## 📋 Data Model Reference

### Course Object
```javascript
{
  _id: ObjectId,
  id: Number,
  title: String,
  description: String,
  categoryId: ObjectId, // Reference to Category
  instructorId: ObjectId, // Reference to Instructor
  duration: String, // e.g., "42.5 hours"
  level: String, // Beginner, Intermediate, Advanced
  price: Number,
  rating: Number, // 0-5
  enrolledStudents: Number,
  skills: [String], // e.g., ["React", "JavaScript"]
  prerequisites: [{courseId: ObjectId, courseName: String}],
  certification: {
    offered: Boolean,
    certificateName: String
  },
  tags: [String],
  isPopular: Boolean,
  trending: Boolean,
  difficulty: Number, // 1-10
  createdAt: Date,
  updatedAt: Date
}
```

### Instructor Object
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  specialization: String,
  yearsOfExperience: Number,
  skills: [String],
  profileImage: String, // URL
  averageRating: Number, // 0-5
  totalStudents: Number,
  coursesCreated: Number,
  isVerified: Boolean,
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String
  }
}
```

### Category Object
```javascript
{
  _id: ObjectId,
  id: Number,
  name: String,
  description: String,
  icon: String, // FontAwesome icon
  color: String, // Hex color
  bannerImage: String, // URL
  totalCourses: Number,
  totalStudents: Number,
  tags: [String],
  isPopular: Boolean,
  trending: Boolean,
  displayOrder: Number
}
```

---

## ⚡ Performance Tips

- Use pagination with limit parameter
- Search instead of fetching all and filtering locally
- Sort results server-side
- Batch related requests (e.g., get category + get courses)
- Cache responses based on data freshness needs
- Use IDs for references instead of full objects

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Category not found" | Verify categoryId is correct ObjectId |
| Connection refused | Ensure MongoDB is running |
| Empty results | Check filter parameters match data |
| 404 Not Found | Verify route is added to app.js |
| Pagination not working | Check page and limit parameters are numbers |

---

## 📞 Resources

- **Full Docs**: IMPROVEMENTS_DOCUMENTATION.md
- **Setup Guide**: SETUP_GUIDE.md
- **Summary**: IMPROVEMENTS_SUMMARY.md
- **Data Examples**: Backend/data/
- **Models**: Backend/models/

---

**Last Updated**: April 14, 2026
**Version**: 1.0
**Status**: Production Ready
