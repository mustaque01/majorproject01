// API Service for Learning Path Dashboard
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Categories API methods
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id) {
    return this.request(`/categories/${id}`);
  }

  async getCoursesByCategory(categoryId) {
    return this.request(`/categories/${categoryId}/courses`);
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Courses API methods
  async getAllCourses() {
    return this.request('/categories/courses/all');
  }

  async getCourseById(id) {
    return this.request(`/categories/courses/${id}`);
  }

  async createCourse(courseData) {
    return this.request('/categories/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request('/categories/stats/dashboard');
  }

  // Validation endpoint
  async validateAllData() {
    return this.request('/categories/validate/all');
  }
}

const apiService = new ApiService();
export default apiService;
