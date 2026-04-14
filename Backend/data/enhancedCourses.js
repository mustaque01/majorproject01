/**
 * Enhanced Courses Data
 * Production-ready course data with relationships and metadata
 */

const enhancedCoursesData = [
    {
        id: 1,
        title: 'Complete React Development',
        description: 'Master React from basics to advanced concepts including hooks, context, and state management. Perfect for beginners wanting to become proficient React developers.',
        categoryId: 1, // Web Development
        instructorId: 1, // Alakh Panday
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
                type: 'pdf',
                size: '2.4 MB',
                progress: 75
            },
            {
                id: 2,
                title: 'State Management Video',
                type: 'video',
                duration: '18:32',
                progress: 100
            }
        ],
        progress: 70,
        skills: ['React', 'JavaScript', 'Hooks', 'State Management', 'Component Design'],
        prerequisites: [],
        requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
        certification: {
            offered: true,
            certificateName: 'React Developer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100'
        },
        difficulty: 6,
        tags: ['react', 'frontend', 'javascript', 'web-development'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-09-01'
    },
    {
        id: 2,
        title: 'Advanced JavaScript Concepts',
        description: 'Deep dive into modern JavaScript ES6+, async programming, and advanced concepts. Master closures, promises, and design patterns.',
        categoryId: 4, // Programming Languages
        instructorId: 1, // Alakh Panday
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
                id: 3,
                title: 'JavaScript Patterns PDF',
                type: 'pdf',
                size: '3.1 MB',
                progress: 45
            },
            {
                id: 4,
                title: 'Async Programming Tutorial',
                type: 'video',
                duration: '25:15',
                progress: 80
            }
        ],
        progress: 25,
        skills: ['JavaScript', 'ES6+', 'Async Programming', 'Promises', 'Closures', 'Design Patterns'],
        prerequisites: [],
        requirements: ['Intermediate JavaScript knowledge', 'HTML/CSS basics'],
        certification: {
            offered: true,
            certificateName: 'Advanced JavaScript Specialist',
            certificateIcon: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=100'
        },
        difficulty: 8,
        tags: ['javascript', 'es6', 'programming-fundamentals'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-02-10',
        updatedAt: '2024-08-28'
    },
    {
        id: 3,
        title: 'Node.js Backend Development',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn RESTful APIs, authentication, and deployment.',
        categoryId: 6, // Database & Backend
        instructorId: 1, // Alakh Panday
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
                id: 5,
                title: 'Express.js Documentation',
                type: 'link',
                url: 'https://expressjs.com/',
                progress: 60
            },
            {
                id: 6,
                title: 'MongoDB Tutorial Series',
                type: 'video',
                duration: '45:20',
                progress: 90
            }
        ],
        progress: 55,
        skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication', 'Backend Development'],
        prerequisites: [
            { courseId: 2, courseName: 'Advanced JavaScript Concepts' }
        ],
        requirements: ['JavaScript knowledge', 'Understanding of HTTP/REST', 'Basic database concepts'],
        certification: {
            offered: true,
            certificateName: 'Backend Developer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100'
        },
        difficulty: 7,
        tags: ['node.js', 'express', 'mongodb', 'backend', 'rest-api'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-01-20',
        updatedAt: '2024-09-05'
    },
    {
        id: 4,
        title: 'React Native Mobile Development',
        description: 'Create cross-platform mobile apps using React Native and modern mobile development practices. Deploy to iOS and Android.',
        categoryId: 2, // Mobile Development
        instructorId: 5, // Emma Rodriguez
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
                id: 7,
                title: 'React Native Setup Guide',
                type: 'pdf',
                size: '1.8 MB',
                progress: 100
            },
            {
                id: 8,
                title: 'Navigation Tutorial',
                type: 'video',
                duration: '32:10',
                progress: 40
            }
        ],
        progress: 35,
        skills: ['React Native', 'Mobile Development', 'JavaScript', 'iOS', 'Android', 'Navigation'],
        prerequisites: [
            { courseId: 1, courseName: 'Complete React Development' }
        ],
        requirements: ['React knowledge', 'JavaScript proficiency', 'Mobile development basics'],
        certification: {
            offered: true,
            certificateName: 'Mobile App Developer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100'
        },
        difficulty: 7,
        tags: ['react-native', 'mobile', 'ios', 'android', 'javascript'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-03-05',
        updatedAt: '2024-08-30'
    },
    {
        id: 5,
        title: 'Full Stack Development Bootcamp',
        description: 'Complete full stack development course covering frontend, backend, and deployment. Transform into a proficient full-stack developer.',
        categoryId: 1, // Web Development
        instructorId: 1, // Alakh Panday
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
                id: 9,
                title: 'Full Stack Roadmap',
                type: 'pdf',
                size: '4.2 MB',
                progress: 85
            },
            {
                id: 10,
                title: 'Project Building Guide',
                type: 'video',
                duration: '60:45',
                progress: 70
            }
        ],
        progress: 60,
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Database Design', 'Deployment', 'Full-Stack Development'],
        prerequisites: [],
        requirements: ['Basic programming knowledge', 'Passion for web development'],
        certification: {
            offered: true,
            certificateName: 'Full Stack Developer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100'
        },
        difficulty: 7,
        tags: ['full-stack', 'web-development', 'javascript', 'react', 'node.js'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-09-06'
    },
    {
        id: 6,
        title: 'Python for Data Science',
        description: 'Learn Python programming with focus on data analysis, pandas, numpy, and machine learning. Start your data science journey.',
        categoryId: 3, // Data Science & AI
        instructorId: 3, // Dr. Michael Chen
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
                id: 11,
                title: 'Python Data Science Handbook',
                type: 'pdf',
                size: '5.2 MB',
                progress: 60
            },
            {
                id: 12,
                title: 'Pandas Tutorial Series',
                type: 'video',
                duration: '28:45',
                progress: 40
            }
        ],
        progress: 45,
        skills: ['Python', 'Pandas', 'NumPy', 'Data Analysis', 'Matplotlib', 'Machine Learning Basics'],
        prerequisites: [],
        requirements: ['Basic programming knowledge', 'Mathematics fundamentals'],
        certification: {
            offered: true,
            certificateName: 'Data Science Fundamentals Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=100'
        },
        difficulty: 6,
        tags: ['python', 'data-science', 'machine-learning', 'data-analysis'],
        isPopular: true,
        trending: false,
        version: 1,
        createdAt: '2024-02-15',
        updatedAt: '2024-09-03'
    },
    {
        id: 7,
        title: 'UI/UX Design Masterclass',
        description: 'Complete guide to user interface and experience design using Figma and design principles. Create stunning user experiences.',
        categoryId: 7, // UI/UX Design
        instructorId: 2, // Sarah Johnson
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
                id: 13,
                title: 'Design System Guidelines',
                type: 'pdf',
                size: '3.8 MB',
                progress: 80
            },
            {
                id: 14,
                title: 'Figma Prototyping Tutorial',
                type: 'video',
                duration: '22:30',
                progress: 95
            }
        ],
        progress: 75,
        skills: ['Figma', 'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
        prerequisites: [],
        requirements: ['No prior design experience needed', 'Creative thinking'],
        certification: {
            offered: true,
            certificateName: 'UI/UX Designer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100'
        },
        difficulty: 4,
        tags: ['ui-design', 'ux-design', 'figma', 'design'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-03-10',
        updatedAt: '2024-08-25'
    },
    {
        id: 8,
        title: 'DevOps with Docker & Kubernetes',
        description: 'Master containerization and orchestration for modern application deployment. Build scalable infrastructure.',
        categoryId: 5, // DevOps & Cloud
        instructorId: 4, // James Morrison
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
                id: 15,
                title: 'Docker Commands Cheatsheet',
                type: 'pdf',
                size: '1.2 MB',
                progress: 100
            },
            {
                id: 16,
                title: 'Kubernetes Deployment Guide',
                type: 'video',
                duration: '35:15',
                progress: 30
            }
        ],
        progress: 20,
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Containers', 'Orchestration', 'DevOps'],
        prerequisites: [
            { courseId: 3, courseName: 'Node.js Backend Development' }
        ],
        requirements: ['Linux basics', 'Backend development knowledge', 'Understanding of APIs'],
        certification: {
            offered: true,
            certificateName: 'DevOps Engineer Certificate',
            certificateIcon: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=100'
        },
        difficulty: 8,
        tags: ['docker', 'kubernetes', 'devops', 'ci-cd', 'aws'],
        isPopular: true,
        trending: true,
        version: 1,
        createdAt: '2024-04-01',
        updatedAt: '2024-09-02'
    }
];

module.exports = enhancedCoursesData;
