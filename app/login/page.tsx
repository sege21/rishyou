"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();
      const passwordHash = CryptoJS.SHA256(password).toString();

      const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("*")
        .eq("username", cleanUser)
        .maybeSingle();

      if (fetchErr || !user) {
        setError("Kullanıcı bulunamadı.");
        setLoading(false);
        return;
      }

      const isValid = (user.password_hash === passwordHash) || (user.password === passwordHash) || (user.password === password);
      if (!isValid) {
        setError("Hatalı şifre.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("rishyou_username", cleanUser);
      router.push("/chat");
    } catch (err: any) {
      setError("Giriş hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box", backgroundColor: "#0e1621" }}>
      <div style={{ width: "100%", maxWidth: "340px", backgroundColor: "#17212b", border: "1px solid #242f3d", borderRadius: "16px", padding: "20px", boxSizing: "border-box", color: "#ffffff", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ width: "48px", height: "48px", margin: "0 auto 8px auto", borderRadius: "12px", backgroundColor: "#242f3d", border: "1px solid #14F195", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
            🐶
          </div>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>Rishyou Giriş</h1>
          <p style={{ fontSize: "11px", color: "#8a9aa8", margin: 0 }}>Web3 Şifreli Mesajlaşma</p>
        </div>

        {error && (
          <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", fontSize: "11px", textAlign: "center", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "bold", color: "#8a9aa8", display: "block", marginBottom: "4px" }}>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullanici_adiniz"
              required
              style={{ width: "100%", backgroundColor: "#242f3d", color: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid transparent", outline: "none", fontSize: "16px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "bold", color: "#8a9aa8", display: "block", marginBottom: "4px" }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", backgroundColor: "#242f3d", color: "#ffffff", padding: "10px 12px", borderRadius: "10px", border: "1px solid transparent", outline: "none", fontSize: "16px", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "linear-gradient(to right, #9945FF, #14F195)", color: "#000000", fontWeight: "bold", fontSize: "13px", borderRadius: "10px", border: "none", cursor: "pointer", marginTop: "4px" }}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "11px", color: "#8a9aa8", marginTop: "14px" }}>
          Hesabın yok mu?{" "}
          <a href="/register" style={{ color: "#14F195", fontWeight: "bold", textDecoration: "none" }}>
            Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}