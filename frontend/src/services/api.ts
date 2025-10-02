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

export const api = axios.create({
  baseURL: API_URL,
});

// injeta o token em cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
