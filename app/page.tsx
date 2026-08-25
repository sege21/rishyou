"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

function RishyouDogIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="loginDogGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9945FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#loginDogGlow)" />
      <path d="M18 22 C12 8, 30 5, 38 18 Z" fill="#FFA726" stroke="#9945FF" strokeWidth="2.5" />
      <path d="M82 22 C88 8, 70 5, 62 18 Z" fill="#FFA726" stroke="#9945FF" strokeWidth="2.5" />
      <ellipse cx="50" cy="52" rx="38" ry="34" fill="#FFB74D" stroke="#14F195" strokeWidth="3" />
      <ellipse cx="50" cy="62" rx="20" ry="16" fill="#FFF3E0" />
      <circle cx="36" cy="46" r="6" fill="#212121" />
      <circle cx="34" cy="44" r="2.5" fill="#FFFFFF" />
      <circle cx="64" cy="46" r="6" fill="#212121" />
      <circle cx="62" cy="44" r="2.5" fill="#FFFFFF" />
      <ellipse cx="27" cy="56" rx="4" ry="2" fill="#FF8A80" opacity="0.6" />
      <ellipse cx="73" cy="56" rx="4" ry="2" fill="#FF8A80" opacity="0.6" />
      <path d="M46 56 Q50 53 54 56 Q50 60 46 56 Z" fill="#D84315" />
      <path d="M50 59 L50 65 Q46 68 44 65 M50 65 Q54 68 56 65" stroke="#4E342E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="85" r="9" fill="#14F195" stroke="#9945FF" strokeWidth="1.5" />
      <path d="M46 83 L54 83 M45 85 L53 85 M46 87 L54 87" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register" | "reset">("login");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhraseInput, setSeedPhraseInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null);

  useEffect(() => {
    const active = sessionStorage.getItem("rishyou_username");
    if (active) router.push("/chat");
  }, [router]);

  function resetFormState(newTab: "login" | "register" | "reset") {
    setTab(newTab);
    setStatus("");
    setGeneratedMnemonic(null);
    setPassword("");
    setNewPassword("");
    setSeedPhraseInput("");
  }

  // 1. Phantom / Solflare ile Tek Tıkla Bağlan
  async function handlePhantomConnect() {
    setStatus("");
    setLoading(true);
    try {
      const win = window as any;
      let provider = null;
      if (win.phantom?.solana?.isPhantom) provider = win.phantom.solana;
      else if (win.solana) provider = win.solana;
      else if (win.solflare?.isSolflare) provider = win.solflare;

      if (!provider) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          const currentUrl = encodeURIComponent(window.location.href);
          window.location.href = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`;
          setLoading(false);
          return;
        }
        throw new Error("Phantom veya Solflare cüzdan eklentisi bulunamadı.");
      }

      setStatus("Cüzdana bağlanılıyor...");
      const resp = await provider.connect();
      const pubkey = (resp?.publicKey || provider.publicKey)?.toString();

      if (!pubkey) throw new Error("Cüzdan adresi alınamadı.");

      const autoUsername = "sol_" + pubkey.slice(0, 6).toLowerCase();
      const { data: existingUser } = await supabase.from("users").select("*").eq("wallet_address", pubkey).maybeSingle();

      if (existingUser) {
        sessionStorage.setItem("rishyou_username", existingUser.username);
        router.push("/chat");
      } else {
        const dummySeed = CryptoJS.AES.encrypt(pubkey, "phantom_secret").toString();
        const { error } = await supabase.from("users").insert([{
          username: autoUsername,
          password_hash: "phantom_login",
          wallet_address: pubkey,
          encrypted_seed: dummySeed
        }]);

        if (error) {
          const fallback = autoUsername + "_" + Math.floor(Math.random() * 1000);
          await supabase.from("users").insert([{
            username: fallback,
            password_hash: "phantom_login",
            wallet_address: pubkey,
            encrypted_seed: dummySeed
          }]);
          sessionStorage.setItem("rishyou_username", fallback);
        } else {
          sessionStorage.setItem("rishyou_username", autoUsername);
        }
        router.push("/chat");
      }
    } catch (e: any) {
      setStatus("Hata: " + (e.message || "İşlem iptal edildi"));
    }
    setLoading(false);
  }

  // 2. Giriş Yap
  async function handleLogin() {
    if (!username.trim() || !password) {
      setStatus("Kullanıcı adı ve şifre giriniz.");
      return;
    }
    setLoading(true);
    setStatus("Giriş yapılıyor...");

    try {
      const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
      const { data: user, error } = await supabase.from("users").select("*").eq("username", cleanUser).maybeSingle();

      if (error || !user) throw new Error("Kullanıcı bulunamadı.");

      let isValid = false;
      if (user.password_hash === "phantom_login") {
        isValid = true;
      } else if (user.password_hash?.startsWith("$2")) {
        isValid = bcrypt.compareSync(password, user.password_hash);
      } else {
        const shaHash = CryptoJS.SHA256(password).toString();
        isValid = (user.password_hash === shaHash || user.password_hash === password);
      }

      if (!isValid) throw new Error("Hatalı hesap şifresi!");

      sessionStorage.setItem("rishyou_username", user.username);
      router.push("/chat");
    } catch (err: any) {
      setStatus("Hata: " + err.message);
    }
    setLoading(false);
  }

  // 3. Yeni Hesap Oluştur (Kayıt Ol)
  async function handleRegister() {
    if (!username.trim() || !password) {
      setStatus("Kullanıcı adı ve şifre zorunludur.");
      return;
    }
    setLoading(true);
    setStatus("Yeni hesap oluşturuluyor...");

    try {
      const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
      const { data: existing } = await supabase.from("users").select("username").eq("username", cleanUser).maybeSingle();
      if (existing) throw new Error("Bu kullanıcı adı zaten alınmış.");

      const mnemonic = bip39.generateMnemonic();
      const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
      const walletAddress = keypair.publicKey.toString();

      const encryptedSeed = CryptoJS.AES.encrypt(mnemonic, password).toString();
      const passwordHash = bcrypt.hashSync(password, 10);

      const { error } = await supabase.from("users").insert([{
        username: cleanUser,
        password_hash: passwordHash,
        wallet_address: walletAddress,
        encrypted_seed: encryptedSeed
      }]);

      if (error) throw error;
      setGeneratedMnemonic(mnemonic);
      setStatus("🎉 Hesap oluşturuldu! Kurtarma anahtarınızı mutlaka güvenli bir yere kaydedin.");
    } catch (err: any) {
      setStatus("Hata: " + err.message);
    }
    setLoading(false);
  }

  // 4. Şifre Sıfırla (12 Kelimelik Seed Doğrulaması ile)
  async function handleResetPassword() {
    if (!username.trim() || !seedPhraseInput.trim() || !newPassword) {
      setStatus("Tüm alanları doldurmanız gerekmektedir.");
      return;
    }
    setLoading(true);
    setStatus("Kurtarma anahtarı doğrulanıyor...");

    try {
      const cleanUser = username.trim().toLowerCase().replace(/^@/, "");
      const { data: user, error } = await supabase.from("users").select("*").eq("username", cleanUser).maybeSingle();

      if (error || !user) throw new Error("Kullanıcı adı bulunamadı.");

      const cleanSeed = seedPhraseInput.trim().toLowerCase();
      if (!bip39.validateMnemonic(cleanSeed)) {
        throw new Error("Girdiğiniz 12 kelimelik kurtarma anahtarı geçersiz!");
      }

      // Seed'den cüzdan adresini türet ve kullanıcı adresi ile karşılaştır
      const seedBuffer = bip39.mnemonicToSeedSync(cleanSeed).slice(0, 32);
      const keypair = Keypair.fromSeed(seedBuffer);
      const derivedWallet = keypair.publicKey.toString();

      if (derivedWallet !== user.wallet_address) {
        throw new Error("Kurtarma anahtarı bu hesaba ait değil!");
      }

      // Yeni şifreyi kaydet ve seed'i yeni şifreyle şifrele
      const newPasswordHash = bcrypt.hashSync(newPassword, 10);
      const newEncryptedSeed = CryptoJS.AES.encrypt(cleanSeed, newPassword).toString();

      const { error: updateErr } = await supabase
        .from("users")
        .update({
          password_hash: newPasswordHash,
          encrypted_seed: newEncryptedSeed
        })
        .eq("username", cleanUser);

      if (updateErr) throw updateErr;

      setStatus("✅ Şifreniz başarıyla yenilendi! Yeni şifrenizle giriş yapabilirsiniz.");
      setTimeout(() => {
        resetFormState("login");
      }, 1500);
    } catch (err: any) {
      setStatus("Hata: " + err.message);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#0e1621] p-3 text-gray-200">
      <div className="w-full max-w-[380px] sm:max-w-md bg-[#17212b]/95 border-2 border-[#14F195]/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(20,241,149,0.2)] flex flex-col items-center backdrop-blur-xl">
        
        {/* Maskot Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#242f3d] border-2 border-[#14F195]/60 flex items-center justify-center mb-2.5 shadow-lg shadow-[#14F195]/10">
          <RishyouDogIcon size={42} />
        </div>

        {/* Başlık */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <h1 className="text-xl font-black text-white tracking-wide">Rishyou</h1>
          <span className="text-[10px] bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black px-1.5 py-0.5 rounded font-black tracking-wider">$RISH</span>
        </div>
        <p className="text-xs text-gray-400 mb-4 text-center">Solana Web3 İletişim Platformu</p>

        {/* Phantom / Solflare Tek Tıkla Bağlan Butonu */}
        <button
          onClick={handlePhantomConnect}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#14F195] to-[#AB9FF2] hover:opacity-95 text-black font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mb-4 active:scale-95 transition-transform cursor-pointer"
        >
          <span>👻</span> Phantom / Solflare ile Bağlan
        </button>

        {/* 3'LÜ SEKMELER: Giriş / Yeni Hesap / Şifre Sıfırla */}
        <div className="flex bg-[#242f3d] p-1 rounded-xl w-full mb-4 gap-1">
          <button
            onClick={() => resetFormState("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === "login" ? "bg-[#14F195] text-black shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Giriş
          </button>
          <button
            onClick={() => resetFormState("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === "register" ? "bg-[#14F195] text-black shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Yeni Hesap
          </button>
          <button
            onClick={() => resetFormState("reset")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === "reset" ? "bg-[#14F195] text-black shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Şifre Sıfırla
          </button>
        </div>

        {/* FORM ALANLARI */}
        <div className="w-full space-y-3">
          
          {/* Ortak Kullanıcı Adı */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullaniciadi"
              className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
            />
          </div>

          {/* 1. SEKME: GİRİŞ ALANLARI */}
          {tab === "login" && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Hesap Şifresi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
              />
            </div>
          )}

          {/* 2. SEKME: YENİ HESAP ALANLARI */}
          {tab === "register" && !generatedMnemonic && (
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Belirleyeceğiniz Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
              />
            </div>
          )}

          {/* 3. SEKME: ŞİFRE SIFIRLAMA ALANLARI */}
          {tab === "reset" && (
            <>
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">12 Kelimelik Kurtarma Anahtarınız (Seed)</label>
                <textarea
                  value={seedPhraseInput}
                  onChange={(e) => setSeedPhraseInput(e.target.value)}
                  placeholder="kelime1 kelime2 kelime3 ... kelime12"
                  className="w-full h-18 bg-[#242f3d] border border-gray-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-[#14F195] font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Yeni Hesap Şifresi</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin"
                  className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
                />
              </div>
            </>
          )}

          {/* Durum / Hata Mesajı */}
          {status && (
            <div className="p-2.5 bg-black/60 border border-[#14F195]/40 rounded-xl text-[11px] text-center text-[#14F195] break-words">
              {status}
            </div>
          )}

          {/* Kayıt Sonrası 12 Kelime Gösterim Kutusu */}
          {generatedMnemonic && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-2 text-left">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                🔑 12 Kelimelik Kurtarma Anahtarınız
              </span>
              <p className="text-[11px] font-mono bg-black/70 p-2.5 rounded-xl text-amber-200 select-all break-words leading-relaxed border border-white/5">
                {generatedMnemonic}
              </p>
              <button
                onClick={() => resetFormState("login")}
                className="w-full py-2 bg-[#14F195] text-black font-black text-xs rounded-xl cursor-pointer active:scale-95"
              >
                Kaydettim, Giriş Yap
              </button>
            </div>
          )}

          {/* Butonlar */}
          {!generatedMnemonic && (
            <button
              onClick={() => {
                if (tab === "login") handleLogin();
                else if (tab === "register") handleRegister();
                else if (tab === "reset") handleResetPassword();
              }}
              disabled={loading}
              className="w-full py-3 bg-[#14F195] hover:bg-[#10c97c] text-black font-black text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95 mt-1 cursor-pointer"
            >
              {loading
                ? "Lütfen bekleyin..."
                : tab === "login"
                ? "Giriş Yap"
                : tab === "register"
                ? "Hesap Oluştur"
                : "Şifremi Sıfırla"}
            </button>
          )}

        </div>

      </div>
    </main>
  );
}