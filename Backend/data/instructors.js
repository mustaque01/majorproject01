/**
 * Enhanced Instructors Data
 * Production-ready instructor data for seeding
 */

const instructorsData = [
    {
        id: 1,
        name: 'Alakh Panday',
        email: 'alakh.panday@learningplatform.com',
        bio: 'Tech educator and full-stack developer with expertise in modern web technologies. Passionate about making complex concepts simple and accessible.',
        specialization: 'Full-Stack Web Development',
        certifications: [
            'AWS Certified Solutions Architect',
            'Google Cloud Associate Cloud Engineer',
            'MongoDB Certified Developer'
        ],
        yearsOfExperience: 12,
        skills: [
            'JavaScript',
            'React',
            'Node.js',
            'MongoDB',
            'AWS',
            'Docker',
            'Kubernetes',
            'Python'
        ],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        socialLinks: {
            twitter: 'https://twitter.com/alakhpanday',
            linkedin: 'https://linkedin.com/in/alakhpanday',
            github: 'https://github.com/alakhpanday',
            website: 'https://alakhpanday.dev'
        },
        totalStudents: 127165,
        averageRating: 4.8,
        coursesCreated: 18,
        isActive: true,
        isVerified: true
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@learningplatform.com',
        bio: 'UX/UI Designer and Design Systems expert with 10+ years in the industry. Dedicated to teaching design thinking and practical design skills.',
        specialization: 'UI/UX Design',
        certifications: [
            'Nielsen Norman UX Certification',
            'Google UX Design Certificate',
            'Figma Professional'
        ],
        yearsOfExperience: 10,
        skills: [
            'Figma',
            'User Research',
            'Wireframing',
            'Prototyping',
            'Design Systems',
            'Interaction Design',
            'CSS',
            'HTML'
        ],
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        socialLinks: {
            twitter: 'https://twitter.com/sarahjdesign',
            linkedin: 'https://linkedin.com/in/sarahjohnson-ux',
            website: 'https://sarahdesigns.io'
        },
        totalStudents: 54200,
        averageRating: 4.9,
        coursesCreated: 8,
        isActive: true,
        isVerified: true
    },
    {
        id: 3,
        name: 'Dr. Michael Chen',
        email: 'michael.chen@learningplatform.com',
        bio: 'Machine Learning researcher and data scientist with PhD in Computer Science. Specialized in AI/ML applications in real-world scenarios.',
        specialization: 'Data Science & AI',
        certifications: [
            'PhD in Computer Science - Stanford',
            'Google Cloud Professional ML Engineer',
            'AWS Machine Learning Certification'
        ],
        yearsOfExperience: 15,
        skills: [
            'Python',
            'TensorFlow',
            'PyTorch',
            'Data Analysis',
            'Machine Learning',
            'Deep Learning',
            'SQL',
            'Pandas'
        ],
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        socialLinks: {
            linkedin: 'https://linkedin.com/in/michaelchen-ml',
            github: 'https://github.com/michaelchen-ai',
            website: 'https://michaelchen.ai'
        },
        totalStudents: 89340,
        averageRating: 4.7,
        coursesCreated: 12,
        isActive: true,
        isVerified: true
    },
    {
        id: 4,
        name: 'James Morrison',
        email: 'james.morrison@learningplatform.com',
        bio: 'DevOps Engineer and Cloud Architect with extensive experience in containerization and orchestration. Helping teams build scalable infrastructure.',
        specialization: 'DevOps & Cloud',
        certifications: [
            'CKA - Certified Kubernetes Administrator',
            'AWS Certified Solutions Architect Professional',
            'Docker Certified Associate'
        ],
        yearsOfExperience: 14,
        skills: [
            'Kubernetes',
            'Docker',
            'AWS',
            'CI/CD',
            'Linux',
            'Terraform',
            'Jenkins',
            'Prometheus'
        ],
        profileImage: 'https://images.unsplash.com/photo-1507842450955-e51b1e9f7b42?w=400&h=400&fit=crop',
        socialLinks: {
            twitter: 'https://twitter.com/jamesdevops',
            linkedin: 'https://linkedin.com/in/jamesmorrison-devops',
            github: 'https://github.com/jamesmorrison-devops'
        },
        totalStudents: 42100,
        averageRating: 4.6,
        coursesCreated: 10,
        isActive: true,
        isVerified: true
    },
    {
        id: 5,
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@learningplatform.com',
        bio: 'Mobile Developer specializing in React Native and cross-platform development. Building apps that work seamlessly across iOS and Android.',
        specialization: 'Mobile Development',
        certifications: [
            'React Native Advanced Certification',
            'iOS Development Certification',
            'Google Play Developer'
        ],
        yearsOfExperience: 9,
        skills: [
            'React Native',
            'JavaScript',
            'Swift',
            'Kotlin',
            'Firebase',
            'TypeScript',
            'Redux',
            'Native Modules'
        ],
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        socialLinks: {
            twitter: 'https://twitter.com/emmacode',
            linkedin: 'https://linkedin.com/in/emmarodriguez-mobile',
            github: 'https://github.com/emmarodriguez'
        },
        totalStudents: 35600,
        averageRating: 4.8,
        coursesCreated: 7,
        isActive: true,
        isVerified: true
    }
];

module.exports = instructorsData;
