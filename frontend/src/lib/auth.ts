export function saveAuth(token: string, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
}
export function getAuth() {
    return { token: localStorage.getItem("token"), userId: localStorage.getItem("userId") };
}
export function clearAuth() {
    localStorage.removeItem("token"); localStorage.removeItem("userId");
}