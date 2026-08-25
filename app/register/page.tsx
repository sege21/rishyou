"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import CryptoJS from "crypto-js";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanUser || cleanUser.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalı.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("username")
        .eq("username", cleanUser)
        .maybeSingle();

      if (existingUser) {
        setError("Bu kullanıcı adı zaten alınmış.");
        setLoading(false);
        return;
      }

      const mnemonic = bip39.generateMnemonic();
      const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
      const walletAddress = keypair.publicKey.toBase58();

      const passwordHash = CryptoJS.SHA256(password).toString();
      const encryptedSeed = CryptoJS.AES.encrypt(mnemonic, password).toString();

      const { error: insertError } = await supabase.from("users").insert([
        {
          username: cleanUser,
          password: passwordHash,
          password_hash: passwordHash,
          wallet_address: walletAddress,
          encrypted_seed: encryptedSeed,
          avatar_url: ""
        }
      ]);

      if (insertError) throw insertError;

      sessionStorage.setItem("rishyou_username", cleanUser);
      localStorage.setItem("rish_token_balance", "1000");
      router.push("/chat");
    } catch (err: any) {
      setError("Kayıt hatası: " + (err.message || "Bilinmeyen bir hata oluştu."));
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
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>Hesap Oluştur</h1>
          <p style={{ fontSize: "11px", color: "#8a9aa8", margin: 0 }}>Solana Web3 Cüzdan & Mesajlaşma</p>
        </div>

        {error && (
          <div style={{ padding: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#f87171", fontSize: "11px", textAlign: "center", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "bold", color: "#8a9aa8", display: "block", marginBottom: "4px" }}>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ornek_kullanici"
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

          <div>
            <label style={{ fontSize: "11px", fontWeight: "bold", color: "#8a9aa8", display: "block", marginBottom: "4px" }}>Şifre Tekrar</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Cüzdan Açılıyor..." : "Kayıt Ol & Cüzdan Aç"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "11px", color: "#8a9aa8", marginTop: "14px" }}>
          Zaten hesabın var mı?{" "}
          <a href="/login" style={{ color: "#14F195", fontWeight: "bold", textDecoration: "none" }}>
            Giriş Yap
          </a>
        </div>
      </div>
    </div>
  );
}