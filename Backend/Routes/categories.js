const express = require('express');
const router = express.Router();

// Categories data
const Category = [
    { 
        id: 1, 
        name: 'Web Development',
        description: 'Frontend, Backend, and Full-Stack web development courses',
        icon: 'fas fa-globe',
        color: '#3B82F6'
    },
    { 
        id: 2, 
        name: 'Mobile Development',
        description: 'iOS, Android, React Native, and Flutter development',
        icon: 'fas fa-mobile-alt',
        color: '#10B981'
    },
    { 
        id: 3, 
        name: 'Data Science & AI',
        description: 'Machine Learning, Data Analysis, and Artificial Intelligence',
        icon: 'fas fa-brain',
        color: '#8B5CF6'
    },
    { 
        id: 4, 
        name: 'Programming Languages',
        description: 'Python, JavaScript, Java, C++, and other programming languages',
        icon: 'fas fa-code',
        color: '#F59E0B'
    },
    { 
        id: 5, 
        name: 'DevOps & Cloud',
        description: 'Docker, Kubernetes, AWS, Azure, and deployment strategies',
        icon: 'fas fa-cloud',
        color: '#EF4444'
    },
    { 
        id: 6, 
        name: 'Database & Backend',
        description: 'SQL, NoSQL, APIs, and server-side development',
        icon: 'fas fa-database',
        color: '#06B6D4'
    },
    { 
        id: 7, 
        name: 'UI/UX Design',
        description: 'User Interface and User Experience design principles',
        icon: 'fas fa-paint-brush',
        color: '#EC4899'
    },
    { 
        id: 8, 
        name: 'Cybersecurity',
        description: 'Ethical hacking, network security, and data protection',
        icon: 'fas fa-shield-alt',
        color: '#DC2626'
    },
    { 
        id: 9, 
        name: 'Digital Marketing',
        description: 'SEO, Social Media, Content Marketing, and Analytics',
        icon: 'fas fa-bullhorn',
        color: '#7C3AED'
    },
    { 
        id: 10, 
        name: 'Business & Finance',
        description: 'Entrepreneurship, Project Management, and Financial Analysis',
        icon: 'fas fa-chart-line',
        color: '#059669'
    },
    { 
        id: 11, 
        name: 'Game Development',
        description: 'Unity, Unreal Engine, and game design fundamentals',
        icon: 'fas fa-gamepad',
        color: '#7C2D12'
    },
    { 
        id: 12, 
        name: 'Blockchain & Crypto',
        description: 'Cryptocurrency, Smart Contracts, and DeFi development',
        icon: 'fas fa-link',
        color: '#B45309'
    }
];

// Courses data
const Course = [
    {
        id: 1,
        title: 'Complete React Development',
        description: 'Master React from basics to advanced concepts including hooks, context, and state management',
        categoryId: 1,
        instructor: 'Alakh Panday',
        duration: '42.5 hours',
        level: 'Intermediate',
        price: 99.99,
        rating: 4.8,
        enrolledStudents: 15420,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        status: 'active',
        topics: [
            'React Fundamentals',
            'React Hooks',
            'State Management',
            'Context API',
            'Advanced Patterns'
        ],
        resources: [
            {
                id: 1,
                title: 'React Hooks Guide',
                type: 'PDF',
                size: '2.4 MB',
                progress: 75
            },
            {
                id: 2,
                title: 'State Management Video',
                type: 'Video',
                duration: '18:32',
                progress: 100
            },
            {
                id: 3,
                title: 'Context API Documentation',
                type: 'Link',
                url: 'https://react.dev/reference/react/useContext',
                progress: 30
            }
        ],
        progress: 70,
        createdAt: '2024-01-15',
        updatedAt: '2024-09-01'
    },
    {
        id: 2,
        title: 'Advanced JavaScript Concepts',
        description: 'Deep dive into modern JavaScript ES6+, async programming, and advanced concepts',
        categoryId: 1,
        instructor: 'Alakh Panday',
        duration: '35.0 hours',
        level: 'Advanced',
        price: 89.99,
        rating: 4.9,
        enrolledStudents: 12850,
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
        status: 'active',
        topics: [
            'ES6+ Features',
            'Async/Await',
            'Promises',
            'Closures',
            'Design Patterns'
        ],
        resources: [
            {
                id: 4,
                title: 'JavaScript Patterns PDF',
                type: 'PDF',
                size: '3.1 MB',
                progress: 45
            },
            {
                id: 5,
                title: 'Async Programming Tutorial',
                type: 'Video',
                duration: '25:15',
                progress: 80
            }
        ],
        progress: 25,
        createdAt: '2024-02-10',
        updatedAt: '2024-08-28'
    },
    {
        id: 3,
        title: 'Node.js Backend Development',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB',
        categoryId: 1,
        instructor: 'Alakh Panday',
        duration: '48.0 hours',
        level: 'Intermediate',
        price: 109.99,
        rating: 4.7,
        enrolledStudents: 9650,
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
        status: 'active',
        topics: [
            'Express.js Framework',
            'MongoDB Integration',
            'RESTful APIs',
            'Authentication',
            'Error Handling'
        ],
        resources: [
            {
                id: 6,
                title: 'Express.js Documentation',
                type: 'Link',
                url: 'https://expressjs.com/',
                progress: 60
            },
            {
                id: 7,
                title: 'MongoDB Tutorial Series',
                type: 'Video',
                duration: '45:20',
                progress: 90
            }
        ],
        progress: 55,
        createdAt: '2024-01-20',
        updatedAt: '2024-09-05'
    },
    {
        id: 4,
        title: 'React Native Mobile Development',
        description: 'Create cross-platform mobile apps using React Native and modern mobile development practices',
        categoryId: 2,
        instructor: 'Alakh Panday',
        duration: '52.5 hours',
        level: 'Intermediate',
        price: 119.99,
        rating: 4.6,
        enrolledStudents: 7840,
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        status: 'active',
        topics: [
            'React Native Basics',
            'Navigation',
            'Native Modules',
            'State Management',
            'App Store Deployment'
        ],
        resources: [
            {
                id: 8,
                title: 'React Native Setup Guide',
                type: 'PDF',
                size: '1.8 MB',
                progress: 100
            },
            {
                id: 9,
                title: 'Navigation Tutorial',
                type: 'Video',
                duration: '32:10',
                progress: 40
            }
        ],
        progress: 35,
        createdAt: '2024-03-05',
        updatedAt: '2024-08-30'
    },
    {
        id: 5,
        title: 'Full Stack Development Bootcamp',
        description: 'Complete full stack development course covering frontend, backend, and deployment',
        categoryId: 1,
        instructor: 'Alakh Panday',
        duration: '85.0 hours',
        level: 'Beginner to Advanced',
        price: 199.99,
        rating: 4.9,
        enrolledStudents: 23150,
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        status: 'active',
        topics: [
            'HTML/CSS/JavaScript',
            'React Development',
            'Node.js & Express',
            'Database Design',
            'Deployment & DevOps'
        ],
        resources: [
            {
                id: 10,
                title: 'Full Stack Roadmap',
                type: 'PDF',
                size: '4.2 MB',
                progress: 85
            },
            {
                id: 11,
                title: 'Project Building Guide',
                type: 'Video',
                duration: '60:45',
                progress: 70
            },
            {
                id: 12,
                title: 'Deployment Checklist',
                type: 'PDF',
                size: '1.5 MB',
                progress: 50
            }
        ],
        progress: 60,
        createdAt: '2024-01-01',
        updatedAt: '2024-09-06'
    },
    {
        id: 6,
        title: 'Python for Data Science',
        description: 'Learn Python programming with focus on data analysis, pandas, numpy, and machine learning',
        categoryId: 3,
        instructor: 'Alakh Panday',
        duration: '38.0 hours',
        level: 'Beginner to Intermediate',
        price: 79.99,
        rating: 4.7,
        enrolledStudents: 18200,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        status: 'active',
        topics: [
            'Python Fundamentals',
            'Pandas & NumPy',
            'Data Visualization',
            'Machine Learning Basics',
            'Jupyter Notebooks'
        ],
        resources: [
            {
                id: 13,
                title: 'Python Data Science Handbook',
                type: 'PDF',
                size: '5.2 MB',
                progress: 60
            },
            {
                id: 14,
                title: 'Pandas Tutorial Series',
                type: 'Video',
                duration: '28:45',
                progress: 40
            }
        ],
        progress: 45,
        createdAt: '2024-02-15',
        updatedAt: '2024-09-03'
    },
    {
        id: 7,
        title: 'UI/UX Design Masterclass',
        description: 'Complete guide to user interface and experience design using Figma and design principles',
        categoryId: 7,
        instructor: 'Alakh Panday',
        duration: '32.5 hours',
        level: 'Beginner',
        price: 89.99,
        rating: 4.9,
        enrolledStudents: 12450,
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        status: 'active',
        topics: [
            'Design Principles',
            'Figma Mastery',
            'Wireframing',
            'Prototyping',
            'User Research'
        ],
        resources: [
            {
                id: 15,
                title: 'Design System Guidelines',
                type: 'PDF',
                size: '3.8 MB',
                progress: 80
            },
            {
                id: 16,
                title: 'Figma Prototyping Tutorial',
                type: 'Video',
                duration: '22:30',
                progress: 95
            }
        ],
        progress: 75,
        createdAt: '2024-03-10',
        updatedAt: '2024-08-25'
    },
    {
        id: 8,
        title: 'DevOps with Docker & Kubernetes',
        description: 'Master containerization and orchestration for modern application deployment',
        categoryId: 5,
        instructor: 'Alakh Panday',
        duration: '45.0 hours',
        level: 'Intermediate to Advanced',
        price: 129.99,
        rating: 4.6,
        enrolledStudents: 8750,
        thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400',
        status: 'active',
        topics: [
            'Docker Fundamentals',
            'Kubernetes Orchestration',
            'CI/CD Pipelines',
            'AWS Deployment',
            'Monitoring & Logging'
        ],
        resources: [
            {
                id: 17,
                title: 'Docker Commands Cheatsheet',
                type: 'PDF',
                size: '1.2 MB',
                progress: 100
            },
            {
                id: 18,
                title: 'Kubernetes Deployment Guide',
                type: 'Video',
                duration: '35:15',
                progress: 30
            }
        ],
        progress: 20,
        createdAt: '2024-04-01',
        updatedAt: '2024-09-02'
    }
];

// Routes

// Get all categories
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: Category,
        total: Category.length
    });
});

// Get category by ID
router.get('/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = Category.find(c => c.id === categoryId);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    
    res.json({
        success: true,
        data: category
    });
});

// Get courses by category
router.get('/:id/courses', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = Category.find(c => c.id === categoryId);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    
    const coursesInCategory = Course.filter(c => c.categoryId === categoryId);
    
    res.json({
        success: true,
        data: {
            category: category,
            courses: coursesInCategory,
            total: coursesInCategory.length
        }
    });
});

// Get all courses
router.get('/courses/all', (req, res) => {
    res.json({
        success: true,
        data: Course,
        total: Course.length
    });
});

// Get course by ID
router.get('/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = Course.find(c => c.id === courseId);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    res.json({
        success: true,
        data: course
    });
});

// Get dashboard statistics
router.get('/stats/dashboard', (req, res) => {
    const totalCourses = Course.length;
    const completedCourses = Course.filter(c => c.progress === 100).length;
    const totalHours = Course.reduce((sum, course) => {
        return sum + parseFloat(course.duration.split(' ')[0]);
    }, 0);
    const totalResources = Course.reduce((sum, course) => {
        return sum + course.resources.length;
    }, 0);
    
    res.json({
        success: true,
        data: {
            totalLearningPaths: totalCourses,
            completedSkills: completedCourses,
            totalHours: totalHours.toFixed(1),
            resources: totalResources,
            categories: Category.length
        }
    });
});

module.exports = router;
