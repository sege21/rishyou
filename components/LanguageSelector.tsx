"use client";
import React, { useState, useEffect, useRef } from "react";
export const LANGUAGES = [
  { code: "TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "RU", label: "Русский", flag: "🇷🇺" },
  { code: "AR", label: "العربية", flag: "🇸🇦" },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" }
];
export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("TR");
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCurrentLang(localStorage.getItem("rishyou_lang") || "TR");
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const changeLang = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem("rishyou_lang", code);
    setIsOpen(false);
    window.location.reload();
  };
  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];
  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182533]/90 hover:bg-[#242f3d] border border-gray-700 hover:border-[#14F195]/50 transition-all text-xs text-white shadow-lg active:scale-95">
        <span className="text-sm">🌍</span>
        <span className="font-bold text-[11px] uppercase">{selected.code}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#17212b] border border-gray-700 shadow-2xl py-1.5 z-50">
          {LANGUAGES.map((l) => (
            <button key={l.code} type="button" onClick={() => changeLang(l.code)} className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-[#242f3d] ${currentLang === l.code ? "text-[#14F195] font-bold" : "text-gray-300"}`}>
              <span>{l.flag}</span><span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}