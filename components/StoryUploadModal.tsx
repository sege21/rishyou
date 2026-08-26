"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StoryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

// 🌟 Kullanıcı arama yapmadan önce anında görebileceği telifsiz hazır süper müzikler
const PRESET_MUSIC = [
  {
    trackId: "preset-1",
    trackName: "Lofi Chill & Relax",
    artistName: "Midnight Vibes",
    artworkUrl60: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    trackId: "preset-2",
    trackName: "Upbeat Summer Party",
    artistName: "DJ Sun",
    artworkUrl60: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&q=80",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    trackId: "preset-3",
    trackName: "Acoustic Sunset",
    artistName: "Indie Folk",
    artworkUrl60: "https://images.unsplash.com/photo-1485602058091-62fa9c90f84a?w=100&q=80",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    trackId: "preset-4",
    trackName: "Cyberpunk Night Drive",
    artistName: "Synthwave",
    artworkUrl60: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=100&q=80",
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  }
];

export default function StoryUploadModal({ isOpen, onClose, onSuccess, currentUser }: StoryUploadModalProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [musicType, setMusicType] = useState<"itunes" | "local">("itunes");
  
  // Müzik Arama ve Liste
  const [searchQuery, setSearchQuery] = useState("");
  const [itunesResults, setItunesResults] = useState<any[]>(PRESET_MUSIC);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Yerel MP3
  const [localAudioFile, setLocalAudioFile] = useState<File | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Modal açıldığında listeyi her zaman Preset müziklerle doldur
  useEffect(() => {
    if (isOpen) {
      setItunesResults(PRESET_MUSIC);
      setSearchQuery("");
      setSelectedTrack(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSearchItunes = async () => {
    if (!searchQuery.trim()) {
      setItunesResults(PRESET_MUSIC); // Boş aratırsa hazır listeye dön
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(searchQuery) + "&entity=song&limit=6");
      const data = await res.json();
      setItunesResults(data.results && data.results.length > 0 ? data.results : PRESET_MUSIC);
    } catch (err) {
      console.error("iTunes arama hatası:", err);
      setItunesResults(PRESET_MUSIC);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocalAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalAudioFile(file);
      setLocalAudioName(file.name);
      setSelectedTrack({
        trackName: file.name.replace(/\.[^/.]+$/, ""),
        artistName: "Cihazdan Yüklendi",
        previewUrl: URL.createObjectURL(file),
        isLocal: true,
        file: file
      });
    }
  };

  const handleShare = async () => {
    if (!mediaFile) {
      alert("Lütfen bir görsel seçin.");
      return;
    }

    setLoading(true);
    try {
      // 1. Görseli Yükle
      const ext = mediaFile.name.split(".").pop();
      const fileName = "stories/" + Date.now() + "_media." + ext;
      const { data: mediaData, error: mediaErr } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, mediaFile);

      let mediaUrl = "";
      if (!mediaErr && mediaData) {
        const { data: pUrl } = supabase.storage.from("chat-attachments").getPublicUrl(fileName);
        mediaUrl = pUrl.publicUrl;
      }

      // 2. Müzik URL'i
      let finalMusicUrl = selectedTrack?.previewUrl || null;
      let finalMusicTitle = selectedTrack?.trackName || null;
      let finalMusicArtist = selectedTrack?.artistName || null;

      if (selectedTrack?.isLocal && localAudioFile) {
        const aExt = localAudioFile.name.split(".").pop();
        const aFileName = "stories/" + Date.now() + "_audio." + aExt;
        const { data: audioData } = await supabase.storage
          .from("chat-attachments")
          .upload(aFileName, localAudioFile);

        if (audioData) {
          const { data: aUrl } = supabase.storage.from("chat-attachments").getPublicUrl(aFileName);
          finalMusicUrl = aUrl.publicUrl;
        }
      }

      // 3. Veritabanına Ekle
      const { error: insertErr } = await supabase.from("stories").insert([
        {
          user_id: currentUser?.id,
          username: currentUser?.username || "Kullanıcı",
          avatar_url: currentUser?.avatar_url || "",
          media_url: mediaUrl || mediaPreview,
          media_type: "image",
          music_url: finalMusicUrl,
          music_title: finalMusicTitle,
          music_artist: finalMusicArtist,
          created_at: new Date().toISOString()
        }
      ]);

      if (insertErr) throw insertErr;

      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Hikaye paylaşılamadı: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 text-white shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold">Yeni Hikaye Paylaş</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Görsel Seçimi */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Görsel</label>
          {mediaPreview ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black border border-zinc-700 group">
              <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Değiştir
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl cursor-pointer bg-zinc-950/50 transition-colors">
              <span className="text-sm text-zinc-400">Görsel Seçmek İçin Tıkla</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleMediaChange} />
            </label>
          )}
        </div>

        {/* Müzik Seçimi */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-400 uppercase">Müzik Ekle (Opsiyonel)</label>
            <div className="flex gap-2 text-xs">
              <button 
                onClick={() => setMusicType("itunes")} 
                className={"px-2 py-1 rounded " + (musicType === "itunes" ? "bg-purple-600 text-white font-bold" : "text-zinc-400 bg-zinc-800")}
              >
                Çevrimiçi
              </button>
              <button 
                onClick={() => setMusicType("local")} 
                className={"px-2 py-1 rounded " + (musicType === "local" ? "bg-purple-600 text-white font-bold" : "text-zinc-400 bg-zinc-800")}
              >
                Cihazdan MP3
              </button>
            </div>
          </div>

          {musicType === "itunes" ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Şarkı veya Sanatçı ara (örn: Tarkan)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchItunes()}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleSearchItunes}
                  className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  {isSearching ? "..." : "Ara"}
                </button>
              </div>

              {itunesResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar border border-zinc-800 rounded-lg p-1">
                  {itunesResults.map((t) => (
                    <div 
                      key={t.trackId}
                      onClick={() => setSelectedTrack(t)}
                      className={"flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors " + (selectedTrack?.trackId === t.trackId ? "bg-purple-900/40 border border-purple-500" : "bg-zinc-950/60 hover:bg-zinc-800")}
                    >
                      <img src={t.artworkUrl60} alt="cover" className="w-8 h-8 rounded shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-white">{t.trackName}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{t.artistName}</p>
                      </div>
                      {selectedTrack?.trackId === t.trackId && <span className="text-xs text-purple-400 font-bold pr-2">Seçildi</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <label className="flex items-center justify-center p-3 border border-dashed border-zinc-700 hover:border-purple-500 rounded-lg cursor-pointer bg-zinc-950/50">
              <span className="text-xs text-zinc-400 truncate">{localAudioName || "Cihazından MP3 / Ses Dosyası Seç"}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleLocalAudioChange} />
            </label>
          )}

          {/* 🌟 MÜZİK DİNLEME OYNATICISI (Burayı ekledim) */}
          {selectedTrack && (
            <div className="flex flex-col bg-zinc-950 p-3 rounded-lg border border-purple-500/40 mt-1 shadow-inner gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-purple-400 text-sm animate-pulse">🎵</span>
                  <span className="text-xs text-purple-200 font-bold truncate">{selectedTrack.trackName} - {selectedTrack.artistName}</span>
                </div>
                <button onClick={() => setSelectedTrack(null)} className="text-zinc-500 hover:text-red-400 text-xs font-bold ml-2">İPTAL ✕</button>
              </div>
              <audio 
                src={selectedTrack.previewUrl} 
                controls 
                autoPlay 
                className="w-full h-8 outline-none rounded-md"
              />
            </div>
          )}
        </div>

        {/* Paylaş Butonu */}
        <button 
          onClick={handleShare} 
          disabled={loading || !mediaFile}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow-lg transition-all"
        >
          {loading ? "Hikaye Yükleniyor..." : "🚀 Hikayeni Paylaş"}
        </button>
      </div>
    </div>
  );
}