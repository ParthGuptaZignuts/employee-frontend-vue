import axios from "axios";

// Set base URL for all requests
axios.defaults.baseURL = "http://127.0.0.1:8000/api";

// Intercept requests and add headers
axios.interceptors.request.use(
  function(config) {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, set Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default axios;
