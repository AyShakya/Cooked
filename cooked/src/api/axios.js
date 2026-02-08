import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const code = localStorage.getItem("vip_code");
  if (code) {
    config.headers["x-vip-code"] = code;
  }
  return config;
});