// src/pages/Login.tsx
import { useState } from "react";
import { api, setToken } from "../lib/api";
import { saveAuth } from "../lib/auth";


export default function Login() {
    const [email, setEmail] = useState("admin@demo.com");
    const [password, setPassword] = useState("admin");


    const submit = async (e: any) => {
        e.preventDefault();
        const { data } = await api.post("/api/v1/auth/login", null, { params: { email, password } });
        saveAuth(data.access_token, data.user_id);
        setToken(data.access_token);
        location.href = "/app/home";
    }
    return (
        <form onSubmit={submit} style={{ maxWidth: 380, margin: "6rem auto" }}>
            <h2>Login</h2>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" /><br />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="password" /><br />
            <button>Entrar</button>
        </form>
    )
}