"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string>("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [cryptoList, setCryptoList] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = sessionStorage.getItem("rishyou_username");
    if (!user) {
      router.push("/");
      return;
    }
    setCurrentUser(user);

    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setActiveChat("global");
    }

    supabase.from("users").select("username").neq("username", user).then(({ data }) => {
      if (data) setUsersList(data);
    });

    const loadCrypto = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false");
        const data = await res.json();
        if (Array.isArray(data)) setCryptoList(data);
      } catch (e) {}
    };
    loadCrypto();
    const interval = setInterval(loadCrypto, 30000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!currentUser || !activeChat) return;

    const fetchMessages = async () => {
      let query = supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (activeChat === "global") {
        query = query.eq("is_global", true);
      } else {
        query = query.or(`and(sender.eq.${currentUser},receiver.eq.${activeChat}),and(sender.eq.${activeChat},receiver.eq.${currentUser})`);
      }
      const { data } = await query;
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("realtime_chat_" + activeChat)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new;
        if (activeChat === "global" && newMsg.is_global) {
          setMessages((prev) => [...prev, newMsg]);
        } else if (
          (newMsg.sender === currentUser && newMsg.receiver === activeChat) ||
          (newMsg.sender === activeChat && newMsg.receiver === currentUser)
        ) {
          setMessages((prev) => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChat) return;

    const isGlobal = activeChat === "global";
    const newMsg = {
      sender: currentUser,
      receiver: isGlobal ? null : activeChat,
      content: inputText.trim(),
      is_global: isGlobal,
      created_at: new Date().toISOString(),
    };

    setInputText("");
    setMessages((prev) => [...prev, newMsg]);
    await supabase.from("messages").insert([newMsg]);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col bg-[#0e1621] text-gray-200 overflow-hidden select-none">
      {/* 1. CANLI TOP 10 COIN BANDI */}
      <div className="w-full bg-[#17212b] border-b border-gray-800/80 py-1.5 px-3 overflow-x-auto shrink-0 flex items-center gap-3.5 z-20">
        <span className="text-[10px] font-black text-[#14F195] uppercase tracking-wider shrink-0 bg-[#14F195]/10 px-2 py-0.5 rounded border border-[#14F195]/30">
          ⚡ TOP 10
        </span>
        {cryptoList.length > 0 ? (
          cryptoList.map((coin) => (
            <div key={coin.id} className="flex items-center gap-1.5 shrink-0 bg-[#242f3d]/80 border border-gray-700/50 px-2 py-1 rounded-lg text-[11px]">
              <span className="font-bold text-white uppercase">{coin.symbol}</span>
              <span className="text-gray-300 font-mono">${coin.current_price >= 1 ? coin.current_price.toLocaleString() : coin.current_price.toFixed(4)}</span>
              <span className={`text-[10px] font-bold ${coin.price_change_percentage_24h >= 0 ? "text-[#14F195]" : "text-rose-400"}`}>
                {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
              </span>
            </div>
          ))
        ) : (
          <span className="text-[11px] text-gray-500 animate-pulse">Canlı piyasa verileri alınıyor...</span>
        )}
      </div>

      {/* 2. ANA PANEL */}
      <div className="flex flex-1 w-full h-full overflow-hidden relative">
        {/* SOL LİSTE */}
        <div className={`w-full md:w-80 md:border-r border-gray-800 bg-[#17212b] flex-col h-full shrink-0 ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-3.5 border-b border-gray-800 flex items-center justify-between bg-[#17212b]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#14F195] text-black font-black flex items-center justify-center text-xs">
                {currentUser ? currentUser[0].toUpperCase() : "R"}
              </div>
              <span className="font-bold text-white text-xs">@{currentUser}</span>
            </div>
            <button
              onClick={() => { sessionStorage.clear(); router.push("/"); }}
              className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg active:scale-95 transition-all"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* RISHYOU GLOBAL KANALI */}
            <div
              onClick={() => setActiveChat("global")}
              className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98] ${
                activeChat === "global" ? "bg-[#14F195] text-black font-bold shadow-lg shadow-[#14F195]/20" : "bg-[#242f3d]/70 hover:bg-[#242f3d] text-white border border-gray-700/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${
                activeChat === "global" ? "bg-black text-[#14F195]" : "bg-[#14F195]/20 text-[#14F195]"
              }`}>#</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">Rishyou Global</div>
                <div className={`text-[10px] truncate ${activeChat === "global" ? "text-black/80" : "text-gray-400"}`}>
                  Canlı Topluluk Odası
                </div>
              </div>
            </div>

            <div className="text-[10px] font-black text-gray-500 uppercase px-2 pt-3 pb-1 tracking-wider">Özel Sohbetler</div>

            {/* KULLANICILAR */}
            {usersList.map((u) => (
              <div
                key={u.username}
                onClick={() => setActiveChat(u.username)}
                className={`p-2.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] ${
                  activeChat === u.username ? "bg-[#14F195] text-black font-bold shadow-md" : "hover:bg-[#242f3d] text-gray-200 border border-transparent hover:border-gray-700/40"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold uppercase text-white shadow-inner">
                  {u.username.slice(0, 2)}
                </div>
                <span className="text-xs font-medium truncate">@{u.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ SOHBET ALANI */}
        <div className={`flex-1 flex-col h-full bg-[#0e1621] relative ${activeChat ? "flex" : "hidden md:flex"}`}>
          {activeChat ? (
            <>
              {/* Başlık */}
              <div className="p-3 bg-[#17212b] border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden flex items-center gap-1 text-xs font-bold text-[#14F195] bg-[#242f3d] px-3 py-1.5 rounded-xl border border-gray-700 active:scale-95 transition-transform"
                  >
                    ← Geri
                  </button>
                  <span className="text-xs font-bold text-white">
                    {activeChat === "global" ? "# Rishyou Global Sohbet" : `@${activeChat}`}
                  </span>
                </div>
                <span className="text-[10px] text-[#14F195] bg-[#14F195]/10 px-2 py-0.5 rounded font-bold">Canlı</span>
              </div>

              {/* Mesaj Akışı */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => {
                  const isMe = m.sender === currentUser;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {activeChat === "global" && !isMe && (
                        <span className="text-[10px] text-gray-400 mb-0.5 ml-1 font-semibold">@{m.sender}</span>
                      )}
                      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs break-words leading-relaxed ${
                        isMe ? "bg-[#14F195] text-black font-semibold rounded-br-none shadow-md shadow-[#14F195]/10" : "bg-[#242f3d] text-white rounded-bl-none border border-gray-700/40"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Mesaj Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#17212b] border-t border-gray-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 bg-[#242f3d] border border-gray-700 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#14F195] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#14F195] text-black text-xs font-black px-4 py-2.5 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md"
                >
                  Gönder
                </button>
              </form>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-xs text-gray-500">
              Sohbet etmek için soldan bir oda veya kişi seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}