"use client";

import React, { useState, useEffect, useRef } from "react";

export const LANGUAGES = [
  { code: "TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "RU", label: "Русский", flag: "🇷🇺" },
  { code: "AR", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" }
];

export default function LanguageSelector({ onLanguageChange }: { onLanguageChange?: (lang: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("TR");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("rishyou_lang") || "TR";
    setCurrentLang(saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLang = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem("rishyou_lang", code);
    setIsOpen(false);
    if (onLanguageChange) onLanguageChange(code);
  };

  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#182533]/80 hover:bg-[#242f3d] border border-gray-700/60 hover:border-[#14F195]/50 transition-all text-xs text-white shadow-md active:scale-95"
        title="Dil Seçimi / Change Language"
      >
        <span className="text-sm">🌍</span>
        <span className="font-bold text-[11px] uppercase tracking-wider text-gray-200">{selected.code}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#17212b] border border-gray-700/80 shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-150">
          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#14F195] border-b border-gray-800 flex items-center gap-1">
            <span>🌍</span> DİL / LANGUAGE
          </div>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLang(l.code)}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-[#242f3d] ${currentLang === l.code ? "text-[#14F195] font-bold bg-[#1e293b]/50" : "text-gray-300"}`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {currentLang === l.code && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}