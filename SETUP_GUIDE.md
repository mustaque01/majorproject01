# Quick Setup Guide - Backend Improvements

## Installation & Setup Steps

### Step 1: Update Your Backend App Configuration

Add the following to your `Backend/app.js` file after your other route definitions:

```javascript
// NEW: Add these imports at the top
const courseRoutes = require('./Routes/coursesApi');
const instructorRoutes = require('./Routes/instructorsApi');
const categoryRoutes = require('./Routes/categoriesApi');

// Add these routes after your other middleware and routes
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/categories', categoryRoutes);
```

### Step 2: Run Database Seeding

After MongoDB is running and models are initialized:

```bash
# Navigate to project root
cd c:\Users\musta\Full Stack Developer\majorproject01

# Run the seeding script
node Backend/scripts/seedDatabase.js
```

**Expected Output:**
```
✓ Instructors: 5
✓ Categories: 12
✓ Courses: 8
✅ Database seeding completed successfully!
```

### Step 3: Verify API Endpoints

Test endpoints using Postman, cURL, or your API client:

```bash
# Test courses endpoint
GET http://localhost:5000/api/courses

# Test instructors endpoint
GET http://localhost:5000/api/instructors

# Test categories endpoint
GET http://localhost:5000/api/categories
```

### Step 4: Update Frontend Components

Update your React components to use the new API endpoints:

**Example - CategoriesList.js:**
```javascript
import { useEffect, useState } from 'react';
import ApiService from '../services/ApiService';

function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await ApiService.get('/api/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="categories-list">
            {categories.map(category => (
                <div key={category._id} className="category-card">
                    <img src={category.bannerImage} alt={category.name} />
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className="courses-count">
                        {category.totalCourses} courses
                    </span>
                </div>
            ))}
        </div>
    );
}

export default CategoriesList;
```

### Step 5: Key API Examples

#### Get All Courses with Filters
```javascript
// Get trending courses
GET /api/courses?trending=true&limit=10

// Get courses by level
GET /api/courses?level=Intermediate&categoryId=<categoryId>

// Search courses
GET /api/courses?search=React&sortBy=rating&sortOrder=-1

// With pagination
GET /api/courses?page=1&limit=10
```

#### Get Instructor Details
```javascript
// Get top instructors
GET /api/instructors?sortBy=averageRating&limit=5

// Get instructor with courses
GET /api/instructors/<instructorId>

// Get instructor stats
GET /api/instructors/<instructorId>/stats

// Search by specialization
GET /api/instructors/specialization/Full-Stack%20Web%20Development
```

#### Get Category Information
```javascript
// Get all categories sorted by display order
GET /api/categories?sortBy=displayOrder

// Get category with courses
GET /api/categories/<categoryId>

// Get category statistics
GET /api/categories/<categoryId>/stats

// Get trending categories
GET /api/categories/trending/categories?limit=5
```

---

## File Structure

```
Backend/
├── models/
│   ├── Instructor.js (NEW)
│   ├── Course.js (UPDATED)
│   └── Category.js (UPDATED)
├── controllers/
│   ├── courseController.js (NEW)
│   ├── instructorController.js (NEW)
│   └── categoryController.js (NEW)
├── Routes/
│   ├── coursesApi.js (NEW)
│   ├── instructorsApi.js (NEW)
│   └── categoriesApi.js (NEW)
├── data/
│   ├── enhancedCategories.js (NEW)
│   ├── enhancedCourses.js (NEW)
│   └── instructors.js (NEW)
└── scripts/
    └── seedDatabase.js (NEW)
```

---

## Environment Setup

### Required Packages
Ensure your `Backend/package.json` includes:
```json
{
  "dependencies": {
    "mongoose": "^7.0.0",
    "express": "^4.18.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### Environment Variables
Create `.env` file in project root if not exists:
```
MONGODB_URI=mongodb://localhost:27017/learning-platform
PORT=5000
NODE_ENV=development
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify MongoDB connection string

### Issue 2: ObjectId Mismatch Error
```
Error: Cast to ObjectId failed for value
```
**Solution:**
- Run seeding script fresh: `node Backend/scripts/seedDatabase.js`
- Clear and rebuild database

### Issue 3: CORS Errors
**Solution:**
- Ensure CORS is configured in app.js
- Add frontend URL to CORS whitelist

---

## Testing the Implementation

### Using cURL
```bash
# Get all courses
curl http://localhost:5000/api/courses

# Get specific course
curl http://localhost:5000/api/courses/<courseId>

# Get courses by category
curl http://localhost:5000/api/courses/category/<categoryId>

# Get instructors
curl http://localhost:5000/api/instructors
```

### Using JavaScript/Fetch
```javascript
// Fetch courses
const response = await fetch('/api/courses?trending=true');
const data = await response.json();
console.log(data.data);

// Fetch instructors
const instructors = await fetch('/api/instructors').then(r => r.json());
console.log(instructors.data);
```

---

## Performance Optimization

Endpoints are optimized with:
- **Indexes**: On frequently queried fields (categoryId, instructorId, status, rating)
- **Pagination**: Default limit of 10 items, customizable up to 100
- **Lean Queries**: Using `.lean()` for read-only operations
- **Selective Fields**: Only fetching needed fields with `.select()`

---

## Next Phases

### Phase 1 (Current) ✅
- Models and Controllers
- API Routes
- Data Seeding
- Basic Integration

### Phase 2 (Recommended)
- Authentication middleware for protected routes
- Input validation and sanitization
- Comprehensive error handling
- API documentation (Swagger/OpenAPI)

### Phase 3 (Future)
- Caching layer (Redis)
- Real-time indexing
- Advanced analytics
- Machine learning recommendations

---

## Support Resources

- **Models Reference**: See `Backend/models/` for schema details
- **Controllers**: See `Backend/controllers/` for endpoint implementations
- **Data Templates**: See `Backend/data/` for data structure examples
- **Full Documentation**: See `IMPROVEMENTS_DOCUMENTATION.md`

---

## Success Checklist

- [ ] Models created/updated in `Backend/models/`
- [ ] Controllers created in `Backend/controllers/`
- [ ] Routes configured in `Backend/Routes/`
- [ ] Routes added to `Backend/app.js`
- [ ] Database seeding script executed
- [ ] API endpoints tested and responding
- [ ] Frontend components updated to use new APIs
- [ ] All filters and pagination working
- [ ] Error handling and validation in place
- [ ] Documentation reviewed and understood

Once all items are checked, your backend improvements are ready for production!
