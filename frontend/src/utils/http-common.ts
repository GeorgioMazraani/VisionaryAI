import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth-storage");
    const parsed = raw ? JSON.parse(raw) : null;
    const token = parsed?.state?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("⚠️ Failed to attach token:", err);
  }

  return config;
});

export default http;
