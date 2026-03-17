import axios from 'axios';
import { toast } from 'react-toastify';

// Get base URLs from environment variables
const USER_API_URL = import.meta.env.VITE_USER_SERVICE_URL;
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_SERVICE_URL;
const ACCOUNT_API_URL = import.meta.env.VITE_ACCOUNT_SERVICE_URL;
const LOAN_API_URL = import.meta.env.VITE_LOAN_SERVICE_URL;

// Helper function to create an axios instance with interceptors
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor: Add JWT token to headers if present
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle 401 Unauthorized globally
  // Skip redirect for auth endpoints (login/register) so the catch block can display proper error toasts
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/login') || requestUrl.includes('/register');

      if (error.response && error.response.status === 401 && !isAuthEndpoint) {
        const msg = error.response?.data?.message;
        if (msg === "ACCOUNT_DEACTIVATED") {
          localStorage.clear();
          toast.error("Your account has been deactivated by admin. Contact bank.");
          window.location.href = "/login";
        } else {
          // General 401 handling
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          localStorage.removeItem('email');
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/admin-access') {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export individual instances for each microservice
export const userApi = createAxiosInstance(USER_API_URL);
export const adminApi = createAxiosInstance(ADMIN_API_URL);
export const accountApi = createAxiosInstance(ACCOUNT_API_URL);
export const loanApi = createAxiosInstance(LOAN_API_URL);
