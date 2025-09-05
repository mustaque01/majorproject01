const express = require('express');




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
    }
]