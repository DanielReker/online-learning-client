import axios from 'axios';
import type {TokenResponseDto} from "../api";

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error("No refresh token");

            const tokenResponseDto =
                await axios.post<TokenResponseDto>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            localStorage.setItem('accessToken', tokenResponseDto.data.accessToken);
            localStorage.setItem('refreshToken', tokenResponseDto.data.refreshToken);

            axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokenResponseDto.data.accessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + tokenResponseDto.data.accessToken;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed", refreshError);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;