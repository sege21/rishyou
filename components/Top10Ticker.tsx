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
      if (Array.isArray(data) && data.length > 0) {
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

  const loopedList = [...cryptoList, ...cryptoList];

  return (
    <div className="w-full bg-[#111923]/95 backdrop-blur-md border-b border-[#242f3d] py-1.5 overflow-hidden relative flex items-center shrink-0 z-10 select-none">
      <style>{`
        @keyframes tickerMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-marquee {
          display: flex;
          width: max-content;
          animation: tickerMarquee 35s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex items-center gap-1.5 pl-3 pr-2.5 bg-[#111923] shrink-0 z-20 border-r border-gray-800 shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
        <span className="text-[10px] font-black text-[#14F195] uppercase tracking-wider">
          🌍 DÜNYA TOP 10
        </span>
      </div>

      <div className="overflow-hidden flex-1 relative">
        <div className="animate-ticker-marquee gap-3 flex items-center">
          {loopedList.map((coin, index) => {
            const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;
            return (
              <div
                key={`${coin.id}-${index}`}
                className="flex items-center gap-1.5 bg-[#1e293b]/70 border border-gray-700/40 px-2.5 py-0.5 rounded-lg text-xs shrink-0 hover:border-[#14F195]/50 transition-colors"
              >
                {coin.image && <img src={coin.image} alt={coin.name} className="w-3.5 h-3.5 rounded-full" />}
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
    </div>
  );
}