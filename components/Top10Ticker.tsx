"use client";

import React, { useState, useEffect } from "react";

export default function Top10Ticker() {
  const [cryptoList, setCryptoList] = useState<any[]>([]);

  const fetchCoins = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setCryptoList(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCoins();
    const timer = setInterval(fetchCoins, 30000);
    return () => clearInterval(timer);
  }, []);

  if (cryptoList.length === 0) return null;

  return (
    <div className="w-full bg-[#17212b]/95 border-b border-gray-800 py-1.5 px-3 overflow-x-auto flex items-center gap-3 shrink-0 scrollbar-none z-10">
      <span className="text-[10px] font-black text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/30 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
        ⚡ TOP 10
      </span>
      <div className="flex items-center gap-3 shrink-0 overflow-x-auto">
        {cryptoList.map((coin) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={coin.id}
              className="flex items-center gap-1.5 bg-[#242f3d]/80 border border-gray-700/50 px-2.5 py-1 rounded-lg text-xs shrink-0"
            >
              <span className="font-bold text-white uppercase text-[11px]">{coin.symbol}</span>
              <span className="text-gray-200 font-mono text-[11px]">
                ${coin.current_price >= 1 ? coin.current_price.toLocaleString() : coin.current_price.toFixed(4)}
              </span>
              <span className={`text-[10px] font-semibold ${isUp ? "text-[#14F195]" : "text-rose-400"}`}>
                {isUp ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}