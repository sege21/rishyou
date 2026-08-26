"use client";
import React, { useEffect, useState, useRef } from "react";

const MUSIC_PRESETS = [
  { url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", name: "Lofi Chill" },
  { url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3", name: "Synthwave Beats" },
  { url: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_6590f1cb75.mp3", name: "Cyber Hop" },
  { url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3", name: "Summer Vibe" },
];

interface StoryModalProps {
  story: {
    id: string;
    image_url: string;
    music_url?: string;
    username?: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

export default function StoryModal({ story, onClose, onComplete }: StoryModalProps) {
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const duration = 10000;
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timer);
          onComplete();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (audioRef.current && story.music_url) {
      audioRef.current.volume = 0.5;
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted, story.music_url]);

  const getMusicName = (url?: string) => {
    if (!url) return "";
    const preset = MUSIC_PRESETS.find((p) => p.url === url);
    return preset ? preset.name : "Özel Parça";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none">
      <div className="absolute top-2 left-2 right-2 h-1 bg-gray-700/60 rounded-full overflow-hidden z-50">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 text-white font-semibold drop-shadow">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-orange-500 flex items-center justify-center text-sm font-bold border border-white/40">
            {story.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="drop-shadow-md text-sm">{story.username || "Kullanıcı"}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/90 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {story.music_url && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-20 left-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/15 shadow-xl hover:bg-black/80 transition"
        >
          <span className="text-sm animate-spin">💿</span>
          <span className="text-xs font-medium max-w-[130px] truncate">{getMusicName(story.music_url)}</span>
          <span className="text-xs ml-1 pl-1.5 border-l border-white/20">{isMuted ? "🔇" : "🔊"}</span>
        </button>
      )}

      <img src={story.image_url} alt="Story" className="w-full h-full object-contain pointer-events-none" />

      {story.music_url && (
        <audio ref={audioRef} src={story.music_url} loop playsInline className="hidden" />
      )}
    </div>
  );
}
