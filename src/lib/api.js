import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests and handle FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // If data is FormData, remove Content-Type to let axios set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Global auth error handling: if the teacher token is invalid/expired, reset and send back to sign in
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('teacherId');
      if (!window.location.pathname.startsWith('/signin')) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const teacherAPI = {
  signIn: async (email, password) => {
    const response = await api.post('/api/auth/teacher/signin', null, {
      params: { email, password },
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  signUp: async (email, password, name, schoolId) => {
    const response = await api.post('/api/auth/teacher/signup', null, {
      params: { email, password, name, school_id: schoolId },
    });
    return response.data;
  },

  requestPasswordReset: async (email) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('app', 'teacher');
    const response = await api.post('/api/auth/password-reset-request', formData);
    return response.data;
  },

  getInvitationStatus: async (token) => {
    const response = await api.get(`/api/auth/teacher/invitation-status?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  acceptInvitation: async (token, password, confirmPassword, name) => {
    const formData = new FormData();
    formData.append('password', password);
    if (confirmPassword) {
      formData.append('confirm_password', confirmPassword);
    }
    if (name) {
      formData.append('name', name);
    }
    // Don't set Content-Type header - axios will set it automatically with boundary for FormData
    const response = await api.post(`/api/auth/teacher/accept-invitation?token=${encodeURIComponent(token)}`, formData);
    return response.data;
  },

  getStudents: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/students`);
    return response.data;
  },

  addStudent: async (teacherId, name, classId) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('class_id', classId);
    const response = await api.post(`/api/teachers/${teacherId}/students`, formData);
    return response.data;
  },

  updateStudent: async (studentId, data) => {
    const response = await api.put(`/api/teachers/students/${studentId}`, null, {
      params: data,
    });
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/api/teachers/students/${studentId}`);
    return response.data;
  },

  resetStudentAuth: async (teacherId, studentId) => {
    const response = await api.post(`/api/teachers/${teacherId}/reset-auth/${studentId}`);
    return response.data;
  },

  getStudentDetail: async (studentId) => {
    const response = await api.get(`/api/teachers/students/${studentId}`);
    return response.data;
  },

  addVocabulary: async (teacherId, vocab) => {
    const response = await api.post(`/api/teachers/${teacherId}/vocabulary`, vocab);
    return response.data;
  },

  getVocabulary: async (teacherId, classId = null) => {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get(`/api/teachers/${teacherId}/vocabulary`, { params });
    return response.data;
  },

  addGrammar: async (teacherId, grammar) => {
    const response = await api.post(`/api/teachers/${teacherId}/grammar`, grammar);
    return response.data;
  },

  getGrammar: async (teacherId, classId = null) => {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get(`/api/teachers/${teacherId}/grammar`, { params });
    return response.data;
  },

  updateGrammar: async (teacherId, grammarId, grammar) => {
    const response = await api.put(`/api/teachers/${teacherId}/grammar/${grammarId}`, grammar);
    return response.data;
  },

  createSurveyQuestion: async (teacherId, question) => {
    const response = await api.post(`/api/teachers/${teacherId}/survey-questions`, question);
    return response.data;
  },

  getSurveyQuestions: async (teacherId, classId = null) => {
    const params = classId ? { class_id: classId } : {};
    const response = await api.get(`/api/teachers/${teacherId}/survey-questions`, { params });
    return response.data;
  },

  getSurveyQuestionDetail: async (questionId) => {
    const response = await api.get(`/api/teachers/survey-questions/${questionId}`);
    return response.data;
  },

  getDashboard: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/dashboard`);
    return response.data;
  },

  getSchools: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/schools`);
    return response.data;
  },

  getClasses: async (teacherId) => {
    const response = await api.get(`/api/teachers/${teacherId}/classes`);
    return response.data;
  },

  addClass: async (teacherId, name) => {
    const formData = new FormData();
    formData.append('name', name);
    const response = await api.post(`/api/teachers/${teacherId}/classes`, formData);
    return response.data;
  },

  updateClass: async (teacherId, classId, data) => {
    const formData = new FormData();
    if (data.name) {
      formData.append('name', data.name);
    }
    const response = await api.put(`/api/teachers/${teacherId}/classes/${classId}`, formData);
    return response.data;
  },

  deleteClass: async (teacherId, classId) => {
    const response = await api.delete(`/api/teachers/${teacherId}/classes/${classId}`);
    return response.data;
  },
};

export default api;

