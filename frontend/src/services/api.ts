import axios from "axios";
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Device, 
  CreateDeviceRequest, 
  UpdateDeviceRequest,
  Heartbeat,
  NotificationRule,
  Notification 
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

console.log('🌐 API URL configurada:', API_URL);
console.log('🔧 Environment variables:', import.meta.env);

export const api = axios.create({
  baseURL: API_URL,
});

// Debug interceptor
api.interceptors.request.use((config) => {
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    data: config.data,
    headers: config.headers
  });
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post("/auth/login", data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<User> =>
    api.post("/auth/register", data).then(res => res.data),
};

// Devices API
export const devicesAPI = {
  getAll: (): Promise<Device[]> =>
    api.get("/devices/").then(res => res.data),
  
  getById: (id: string): Promise<Device> =>
    api.get(`/devices/${id}`).then(res => res.data),
  
  create: (data: CreateDeviceRequest): Promise<Device> =>
    api.post("/devices/", data).then(res => res.data),
  
  update: (id: string, data: UpdateDeviceRequest): Promise<Device> =>
    api.put(`/devices/${id}`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/devices/${id}`).then(res => res.data),
};

// Heartbeats API
export const heartbeatsAPI = {
  getAll: (params?: { limit?: number; device_sn?: string }): Promise<Heartbeat[]> =>
    api.get("/heartbeats/", { params }).then(res => res.data),
  
  getByDevice: (deviceSn: string, limit = 100): Promise<Heartbeat[]> =>
    api.get(`/heartbeats/?device_sn=${deviceSn}&limit=${limit}`).then(res => res.data),
};

// Notifications API
export const notificationsAPI = {
  getRules: (userId: string): Promise<NotificationRule[]> =>
    api.get(`/notifications/rules?user_id=${userId}`).then(res => res.data),
  
  createRule: (data: Omit<NotificationRule, 'id' | 'created_at'>): Promise<NotificationRule> =>
    api.post("/notifications/rules", data).then(res => res.data),
  
  deleteRule: (ruleId: string): Promise<void> =>
    api.delete(`/notifications/rules/${ruleId}`).then(res => res.data),
  
  getNotifications: (userId: string, limit = 100): Promise<Notification[]> =>
    api.get(`/notifications/?user_id=${userId}&limit=${limit}`).then(res => res.data),
};
