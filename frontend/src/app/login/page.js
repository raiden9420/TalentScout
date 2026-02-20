"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.login(password);
            localStorage.setItem("token", res.access_token);
            router.push("/admin");
        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <div className="container" style={{ height: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass login-card">
                <h1>Admin Login</h1>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    <input
                        type="password"
                        className="input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary">Unlock Dashboard</button>
                </form>
            </div>
            <style jsx>{`
        .login-card {
          padding: 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
      `}</style>
        </div>
    );
}
