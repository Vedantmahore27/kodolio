import axios from "axios"

const axiosClient =  axios.create({
    baseURL: 'https://kodolio-backend.onrender.com',
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to debug outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    console.log('[AXIOS] Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('[AXIOS] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to debug responses
axiosClient.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('[AXIOS] Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosClient;

