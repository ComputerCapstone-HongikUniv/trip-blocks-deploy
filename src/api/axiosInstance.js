import axios from 'axios';

// .env에서 불러오기
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials: true,
});

// ❗ 요청 보낼 때 토큰 자동 첨부
axiosInstance.interceptors.request.use(
  (config) => {
    // 로그인/회원가입 요청이면 토큰 안 붙임
    if (
      config.url?.startsWith('/signin') ||
      config.url?.startsWith('/signup')
    ) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;