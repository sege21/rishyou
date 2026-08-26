"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StoryUploadModal from "./StoryUploadModal";
import StoryViewerModal, { StoryItem } from "./StoryViewerModal";

export default function StoryBar() {
  const [mounted, setMounted] = useState(false);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "Ben",
        avatar_url: user.user_metadata?.avatar_url || ""
      });
    }
  };

  const fetchStories = async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStories(data);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUser();
    fetchStories();

    const channelId = "story_chan_" + Math.random().toString(36).substring(2, 8);
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "stories" }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full bg-zinc-950/80 p-3 border-b border-zinc-800 flex gap-3 overflow-x-auto custom-scrollbar shrink-0">
      {/* Hikaye Ekle (+) */}
      <div 
        className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
        onClick={() => setIsUploadOpen(true)}
      >
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-600 group-hover:border-purple-400 flex items-center justify-center bg-zinc-900 transition-colors">
          <span className="text-xl text-zinc-400 group-hover:text-purple-400 font-bold">+</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-medium">Hikayen</span>
      </div>

      {/* Aktif Hikayeler */}
      {stories.map((story, idx) => (
        <div 
          key={story.id} 
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer transform hover:scale-105 transition-transform"
          onClick={() => {
            setSelectedIndex(idx);
            setIsViewerOpen(true);
          }}
        >
          <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 border-2 border-black">
              {story.avatar_url ? (
                <img src={story.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-purple-700">
                  {story.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-zinc-200 font-medium truncate w-14 text-center">@{story.username}</span>
        </div>
      ))}

      <StoryUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchStories}
        currentUser={currentUser}
      />

      {stories.length > 0 && (
        <StoryViewerModal 
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          stories={stories}
          initialIndex={selectedIndex}
        />
      )}
    </div>
  );
}
