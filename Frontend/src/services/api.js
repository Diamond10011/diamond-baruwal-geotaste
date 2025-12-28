import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/'

export const register = async (data) => axios.post(`${API_URL}register/`, data);
export const login = async (data) => axios.post(`${API_URL}login/`, data);
export const forgotPassword = async (data) => axios.post(`${API_URL}forgot-password/`, data);
export const verifyOTP = async (data) => axios.post(`${API_URL}verify-otp/`, data);
export const resetPassword = async (data) => axios.post(`${API_URL}reset-password/`, data);

// Protected calls with token
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } });

export const getHome = async () => axios.get(`${API_URL}home/`, getAuthHeader());
export const getUserDashboard = async () => axios.get(`${API_URL}user-dashboard/`, getAuthHeader());
export const getAdminDashboard = async () => axios.get(`${API_URL}admin-dashboard/`, getAuthHeader());