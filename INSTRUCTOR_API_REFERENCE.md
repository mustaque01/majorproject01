# Instructor Backend API - Quick Reference Card

## 🗂️ BASE URL: `http://localhost:5000/api`

---

## 1️⃣ AUTHENTICATION

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new instructor |
| POST | `/auth/login` | ❌ | Login and get tokens |
| POST | `/auth/logout` | ✅ | Logout user |
| GET | `/auth/me` | ✅ | Get current user profile |

---

## 2️⃣ INSTRUCTOR PROFILE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/instructor/profile` | ✅ | Get instructor profile |
| PUT | `/instructor/profile` | ✅ | Update profile (name, bio, skills, etc.) |

---

## 3️⃣ COURSE MANAGEMENT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/instructor/courses` | List all my courses |
| POST | `/instructor/courses` | Create new course |
| GET | `/instructor/courses/:courseId` | Get course details |
| PUT | `/instructor/courses/:courseId` | Update course |
| DELETE | `/instructor/courses/:courseId` | Delete course |
| POST | `/instructor/courses/:courseId/publish` | Publish course |
| POST | `/instructor/courses/:courseId/unpublish` | Unpublish course |

---

## 4️⃣ ANALYTICS & DASHBOARD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/instructor/dashboard` | Complete dashboard overview |
| GET | `/instructor/courses/:courseId/analytics` | Course-level analytics |
| GET | `/instructor/performance-summary` | Performance metrics |
| GET | `/instructor/earnings` | Earnings report by period |
| GET | `/instructor/reviews` | Aggregated reviews |

---

## 🔑 ALL REQUESTS REQUIRE

```
Header: Authorization: Bearer <access_token>
Header: Content-Type: application/json
```

---

## 📊 KEY STATISTICS PROVIDED

- Total courses (active/draft)
- Total students and revenue
- Average rating
- Course breakdown by level
- Top performing courses
- 30-day growth metrics
- Student reviews & ratings

---

**Version: 2.1.0 | Ready for Production** ✅
