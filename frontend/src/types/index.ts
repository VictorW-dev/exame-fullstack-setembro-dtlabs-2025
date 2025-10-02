// Types for the application

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Device {
  id: string;
  sn: string;
  user_id: string;
  name: string;
  location: string;
  description?: string;
  created_at: string;
  last_heartbeat?: string;
}

export interface Heartbeat {
  id: string;
  device_sn: string;
  cpu: number;
  ram: number;
  disk_free: number;
  temperature: number;
  dns_latency_ms: number;
  connectivity: number;
  boot_ts_utc: string;
  created_at: string;
}

export interface NotificationRule {
  id: string;
  user_id: string;
  name: string;
  scope: string;
  device_sns: string;
  condition: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  rule_id: string;
  device_sn: string;
  payload: any;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateDeviceRequest {
  sn: string;
  name: string;
  location: string;
  description?: string;
  user_id: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  location?: string;
  description?: string;
}
