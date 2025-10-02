import { api } from "./api";

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  const { access_token, user_id } = response.data;

  localStorage.setItem("token", access_token);
  localStorage.setItem("user_id", user_id);

  return response.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
