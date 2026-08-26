"use client";

import React, { useState, useEffect, useRef } from "react";

export interface StoryItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  media_url: string;
  music_url?: string;
  music_title?: string;
  music_artist?: string;
  created_at: string;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryItem[];
  initialIndex: number;
}

export default function StoryViewerModal({ isOpen, onClose, stories, initialIndex }: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  // Otomatik Müzik Çalma
  useEffect(() => {
    if (isOpen && currentStory?.music_url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch((e) => console.log("Otomatik oynatma bekliyor:", e));
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentIndex, isOpen, currentStory?.music_url]);

  // 10 Saniyelik İlerleme Çubuğu
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    setProgress(0);
    const duration = 10000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isOpen]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center select-none backdrop-blur-xl">
      {currentStory.music_url && (
        <audio 
          ref={audioRef} 
          src={currentStory.music_url} 
          preload="auto" 
          playsInline
        />
      )}

      <div className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Üst Zaman Çubukları */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? progress + "%" : "0%"
                }}
              />
            </div>
          ))}
        </div>

        {/* Üst Bilgi Barı */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm border border-white/40 overflow-hidden">
              {currentStory.avatar_url ? (
                <img src={currentStory.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                currentStory.username?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-bold drop-shadow">@{currentStory.username}</span>
              {currentStory.music_title && (
                <span className="text-[10px] text-purple-300 font-medium flex items-center gap-1 drop-shadow">
                  🎵 {currentStory.music_title} - {currentStory.music_artist}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStory.music_url && (
              <button 
                onClick={toggleMute} 
                className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 text-xs transition-colors"
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            )}
            <button onClick={onClose} className="text-white/80 hover:text-white text-lg font-bold px-2">✕</button>
          </div>
        </div>

        {/* Medya */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img src={currentStory.media_url} alt="Story" className="w-full h-full object-cover" />
          <div className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev} />
          <div className="absolute right-0 inset-y-0 w-2/3 z-20 cursor-pointer" onClick={handleNext} />
        </div>
      </div>
    </div>
  );
}
