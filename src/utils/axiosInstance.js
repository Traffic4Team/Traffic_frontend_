import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://trafficbackend.shop', // 기본 URL 설정
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; // 헤더에 accessToken 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;