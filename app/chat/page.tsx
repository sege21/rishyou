"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" }
  ],
  iceCandidatePoolSize: 10
};

const SOLANA_RPC = "https://rpc.ankr.com/solana";

const AUDIO_PARAMS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000
};

function RishyouDogIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dogGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9945FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#dogGlow)" />
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

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<"all" | "direct" | "groups" | "locked">("all");
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; isGroup: boolean } | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [activeChatPartners, setActiveChatPartners] = useState<string[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [pinnedChats, setPinnedChats] = useState<string[]>([]);
  const [lockedChats, setLockedChats] = useState<string[]>([]);
  const [isLockedTabUnlocked, setIsLockedTabUnlocked] = useState(false);
  const [pinPromptModalOpen, setPinPromptModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pendingLockedChat, setPendingLockedChat] = useState<any | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [dogMenuOpen, setDogMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"privacy" | "lang" | "sound" | "theme" | "pin">("privacy");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [starredModalOpen, setStarredModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [activeStoryView, setActiveStoryView] = useState<any | null>(null);

  const [chatTimerModalOpen, setChatTimerModalOpen] = useState(false);
  const [chatTimers, setChatTimers] = useState<Record<string, number>>({});

  const [hideOnline, setHideOnline] = useState(false);
  const [disableReadReceipts, setDisableReadReceipts] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [appPin, setAppPin] = useState("1234");
  const [lang, setLang] = useState("tr");

  const [presenceMap, setPresenceMap] = useState<Record<string, { online: boolean; lastSeen?: string }>>({});
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  const [solPrice, setSolPrice] = useState<number>(96.40);
  const [solChange, setSolChange] = useState<string>("+1.40%");
  const [tpsCount, setTpsCount] = useState<number>(2374);

  const [stories, setStories] = useState<any[]>([
    { id: "1", user: "Rishyou_Official", text: "🐶 $RISH Web3 Messenger Devrede!", color: "from-purple-600 to-emerald-500" }
  ]);
  const [newStoryText, setNewStoryText] = useState("");
  const [vaultNotes, setVaultNotes] = useState<string[]>([]);
  const [newVaultNote, setNewVaultNote] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [rishBalance, setRishBalance] = useState<number>(1000);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // ARAMA VE WEBRTC MOTORU
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [callStatus, setCallStatus] = useState<string>("");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [currentCallLogId, setCurrentCallLogId] = useState<number | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
  const activeChatRef = useRef<any>(null);
  const groupsRef = useRef<any[]>([]);
  const currentCallPartnerRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<any[]>([]);
  const signalChannelRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const dialtoneRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { groupsRef.current = groups; }, [groups]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") setNotificationsAllowed(true);
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((p) => setNotificationsAllowed(p === "granted"));
      }
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function triggerPushNotification(title: string, body: string, isCall: boolean = false) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ title, body, type: isCall ? "call" : "msg" });
        } else {
          new Notification(title, { body, icon: "/favicon.ico", vibrate: isCall ? [500, 250, 500] : [200, 100] } as any);
        }
      } catch {}
    }
  }

  useEffect(() => {
    if (isCallActive) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => setCallDuration((p) => p + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [isCallActive]);

  function formatCallTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function getStorageKey(user: string, partnerOrGroupId: string, isGroup: boolean) {
    return isGroup ? `rishyou_history_grp_${partnerOrGroupId}` : `rishyou_history_dm_${[user, partnerOrGroupId].sort().join("_")}`;
  }

  function saveMessageLocal(user: string, partnerOrGroupId: string, isGroup: boolean, msg: any) {
    try {
      const key = getStorageKey(user, partnerOrGroupId, isGroup);
      const existing: any[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = existing.findIndex((m) => m.created_at === msg.created_at && m.sender === msg.sender && m.content === msg.content);
      if (idx >= 0) existing[idx] = { ...existing[idx], ...msg };
      else existing.push(msg);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
  }

  function getMessagesLocal(user: string, partnerOrGroupId: string, isGroup: boolean): any[] {
    try {
      const key = getStorageKey(user, partnerOrGroupId, isGroup);
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch { return []; }
  }

  function selectChat(chat: { id: string; name: string; isGroup: boolean } | null) {
    if (!chat) {
      setActiveChat(null);
      if (currentUser) localStorage.removeItem(`rishyou_active_chat_${currentUser}`);
      return;
    }

    const chatId = chat.isGroup ? `grp_${chat.id}` : chat.name;
    const isLocked = lockedChats.includes(chatId);

    if (isLocked && !isLockedTabUnlocked) {
      setPendingLockedChat(chat);
      setPinPromptModalOpen(true);
      return;
    }

    setActiveChat(chat);
    if (currentUser) {
      localStorage.setItem(`rishyou_active_chat_${currentUser}`, JSON.stringify(chat));
      if (!chat.isGroup) addChatPartner(chat.name);
    }

    if (signalChannelRef.current && currentUser && !disableReadReceipts) {
      signalChannelRef.current.send({
        type: "broadcast",
        event: "read_receipt",
        payload: { reader: currentUser, partner: chat.name }
      });
    }
  }

  function toggleLockChat(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = lockedChats.includes(id) ? lockedChats.filter((x) => x !== id) : [...lockedChats, id];
    setLockedChats(updated);
    if (currentUser) syncUserDataToCloud(currentUser, { locked_chats: updated });
  }

  function togglePin(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = pinnedChats.includes(id) ? pinnedChats.filter((x) => x !== id) : [...pinnedChats, id];
    setPinnedChats(updated);
    if (currentUser) syncUserDataToCloud(currentUser, { pinned_chats: updated });
  }

  function setAutoDeleteForCurrentChat(hours: number) {
    if (!currentUser || !activeChat) return;
    const chatKey = activeChat.isGroup ? `grp_${activeChat.id}` : activeChat.name;
    const updated = { ...chatTimers, [chatKey]: hours };
    setChatTimers(updated);
    syncUserDataToCloud(currentUser, { chat_timers: updated });
    setChatTimerModalOpen(false);
  }

  function saveVaultNote() {
    if (!newVaultNote.trim() || !currentUser) return;
    const updated = [newVaultNote.trim(), ...vaultNotes];
    setVaultNotes(updated);
    syncUserDataToCloud(currentUser, { vault_notes: updated });
    setNewVaultNote("");
  }

  function saveUserSettings(updated: any) {
    if (!currentUser) return;
    const newSettings = { hideOnline, disableReadReceipts, screenshotProtection, soundEnabled, appPin, lang, ...updated };
    syncUserDataToCloud(currentUser, { settings: newSettings });

    if (updated.hideOnline !== undefined && signalChannelRef.current) {
      signalChannelRef.current.track({ username: currentUser, online_at: new Date().toISOString(), hideOnline: updated.hideOnline });
    }
  }

  function handlePinSubmit() {
    if (enteredPin === appPin) {
      setIsLockedTabUnlocked(true);
      setPinPromptModalOpen(false);
      setEnteredPin("");
      if (pendingLockedChat) {
        setActiveChat(pendingLockedChat);
        setPendingLockedChat(null);
      }
    } else {
      alert("Hatalı PIN!");
      setEnteredPin("");
    }
  }

  function addChatPartner(partnerName: string) {
    setActiveChatPartners((prev) => {
      if (prev.includes(partnerName)) return prev;
      const updated = [partnerName, ...prev];
      if (currentUser) localStorage.setItem(`rishyou_partners_${currentUser}`, JSON.stringify(updated));
      return updated;
    });
  }

  async function syncUserDataToCloud(username: string, updates: any) {
    try {
      await supabase.from("user_data").upsert({ username, ...updates, updated_at: new Date().toISOString() });
    } catch {}
  }

  async function loadUserDataFromCloud(username: string) {
    try {
      const { data } = await supabase.from("user_data").select("*").eq("username", username).single();
      if (data) {
        if (data.pinned_chats) setPinnedChats(data.pinned_chats);
        if (data.locked_chats) setLockedChats(data.locked_chats);
        if (data.chat_timers) setChatTimers(data.chat_timers);
        if (data.vault_notes) setVaultNotes(data.vault_notes);
        if (data.settings) {
          const s = data.settings;
          if (s.hideOnline !== undefined) setHideOnline(s.hideOnline);
          if (s.disableReadReceipts !== undefined) setDisableReadReceipts(s.disableReadReceipts);
          if (s.screenshotProtection !== undefined) setScreenshotProtection(s.screenshotProtection);
          if (s.soundEnabled !== undefined) setSoundEnabled(s.soundEnabled);
          if (s.appPin !== undefined) setAppPin(s.appPin);
          if (s.lang !== undefined) setLang(s.lang);
        }
      }
    } catch {}
  }

  async function checkOfflineIncomingCalls(username: string) {
    try {
      const { data } = await supabase.from("call_logs").select("*").eq("receiver", username).eq("status", "calling").order("created_at", { ascending: false }).limit(1);
      if (data && data.length > 0) {
        const call = data[0];
        const callTime = new Date(call.created_at).getTime();
        if (Date.now() - callTime < 45000) {
          currentCallPartnerRef.current = call.caller;
          setCurrentCallLogId(call.id);
          setIsVideoCall(call.call_type === "video");
          setIncomingCall({ sender: call.caller, payload: "" });
        } else {
          await supabase.from("call_logs").update({ status: "missed" }).eq("id", call.id);
        }
      }
    } catch {}
  }

  useEffect(() => {
    const user = sessionStorage.getItem("rishyou_username") || localStorage.getItem("rishyou_username");
    if (!user) {
      router.push("/");
    } else {
      setCurrentUser(user);
      localStorage.setItem("rishyou_username", user);
      sessionStorage.setItem("rishyou_username", user);

      const savedPartners = localStorage.getItem(`rishyou_partners_${user}`);
      if (savedPartners) {
        try { setActiveChatPartners(JSON.parse(savedPartners)); } catch {}
      }

      const lastChat = localStorage.getItem(`rishyou_active_chat_${user}`);
      if (lastChat) {
        try { setActiveChat(JSON.parse(lastChat)); } catch {}
      }

      loadUsers(user);
      loadGroups(user);
      loadWalletData(user);
      loadChatPartners(user);
      loadUserDataFromCloud(user);
      checkOfflineIncomingCalls(user);
      initRealtimeHub(user, hideOnline);
    }

    const tpsInterval = setInterval(() => setTpsCount((p) => p + Math.floor(Math.random() * 11) - 5), 3000);
    const pollInterval = setInterval(() => { if (user) checkOfflineIncomingCalls(user); }, 6000);

    return () => {
      clearInterval(tpsInterval);
      clearInterval(pollInterval);
      if (signalChannelRef.current) supabase.removeChannel(signalChannelRef.current);
    };
  }, [router]);

  useEffect(() => {
    if (localVideoRef.current && localStreamState && isVideoCall) localVideoRef.current.srcObject = localStreamState;
  }, [localStreamState, callModalOpen, isVideoCall]);

  useEffect(() => {
    if (localStreamRef.current) localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = !isMuted; });
  }, [isMuted]);

  useEffect(() => {
    if (localStreamRef.current) localStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = !cameraOff; });
  }, [cameraOff]);

  useEffect(() => {
    if (incomingCall && soundEnabled) ringtoneRef.current?.play().catch(() => {});
    else { ringtoneRef.current?.pause(); if (ringtoneRef.current) ringtoneRef.current.currentTime = 0; }
  }, [incomingCall, soundEnabled]);

  useEffect(() => {
    if (callStatus.includes("aranıyor") && soundEnabled) dialtoneRef.current?.play().catch(() => {});
    else { dialtoneRef.current?.pause(); if (dialtoneRef.current) dialtoneRef.current.currentTime = 0; }
  }, [callStatus, soundEnabled]);

  useEffect(() => {
    if (!currentUser || !activeChat) return;
    if (activeChat.isGroup) loadGroupMessages(activeChat.id);
    else loadDirectMessages(currentUser, activeChat.name);
  }, [currentUser, activeChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadUsers(current: string) { 
    try { const { data } = await supabase.from("users").select("username, wallet_address").neq("username", current); if (data) setUsers(data); } catch {}
  }

  async function loadChatPartners(current: string) {
    try {
      const { data } = await supabase.from("messages").select("sender, receiver");
      if (data) {
        const partners = new Set<string>(activeChatPartners);
        data.forEach((m) => { 
          if (m.sender === current) partners.add(m.receiver); 
          if (m.receiver === current) partners.add(m.sender); 
        });
        const arr = Array.from(partners);
        setActiveChatPartners(arr);
        localStorage.setItem(`rishyou_partners_${current}`, JSON.stringify(arr));
      }
    } catch {}
  }

  async function loadGroups(username: string) {
    try {
      const { data } = await supabase.from("groups").select("*");
      if (data) {
        const myGroups = data.filter((g: any) => g.created_by === username || (Array.isArray(g.members) && g.members.includes(username)));
        setGroups(myGroups);
      }
    } catch {}
  }

  async function loadDirectMessages(u1: string, u2: string) { 
    const localMsgs = getMessagesLocal(u1, u2, false);
    setMessages(localMsgs);
    try {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true }); 
      if (!error && data) {
        const filtered = data.filter((m: any) => (m.sender === u1 && m.receiver === u2) || (m.sender === u2 && m.receiver === u1));
        const mergedMap = new Map();
        [...localMsgs, ...filtered].forEach((m) => {
          mergedMap.set(`${m.sender}_${m.created_at}_${m.content}`, m);
          saveMessageLocal(u1, u2, false, m);
        });
        setMessages(Array.from(mergedMap.values()));
      }
    } catch {}
  }

  async function loadGroupMessages(groupId: string) { 
    if (!groupsRef.current.some((g) => g.id === groupId)) return setMessages([]);
    const localMsgs = getMessagesLocal(currentUser || "", groupId, true);
    setMessages(localMsgs);
    try {
      const { data, error } = await supabase.from("group_messages").select("*").eq("group_id", groupId).order("created_at", { ascending: true }); 
      if (!error && data) {
        const mergedMap = new Map();
        [...localMsgs, ...data].forEach((m) => {
          mergedMap.set(`${m.sender}_${m.created_at}_${m.content}`, m);
          if (currentUser) saveMessageLocal(currentUser, groupId, true, m);
        });
        setMessages(Array.from(mergedMap.values()));
      }
    } catch {}
  }

  async function loadWalletData(username: string) {
    try {
      const { data } = await supabase.from("users").select("wallet_address").eq("username", username).single();
      if (data && data.wallet_address) {
        setWalletAddress(data.wallet_address);
        try {
          const conn = new Connection(SOLANA_RPC, "confirmed");
          const bal = await conn.getBalance(new PublicKey(data.wallet_address));
          setSolBalance(bal / LAMPORTS_PER_SOL);
        } catch { setSolBalance(0); }
      }
    } catch {}
  }

  // ==========================================
  // WEBRTC ÇELİK GİBİ ÇEKİRDEK MOTORU
  // ==========================================
  function initRealtimeHub(username: string, isHideOnline: boolean) {
    const channel = supabase.channel(`rishyou_realtime_hub`, { config: { broadcast: { self: false }, presence: { key: username } } });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const updatedMap: Record<string, { online: boolean; lastSeen?: string }> = {};
      Object.keys(state).forEach((usr) => {
        const presences = state[usr] as any[];
        if (presences && presences.length > 0 && !presences[0].hideOnline) {
          updatedMap[presences[0].username] = { online: true, lastSeen: presences[0].online_at };
        }
      });
      setPresenceMap(updatedMap);
    });

    channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
      if (!payload || payload.receiver !== username) return;

      if (payload.type === "offer") {
        currentCallPartnerRef.current = payload.sender;
        setIncomingCall(payload);
        triggerPushNotification("📞 Gelen Arama", `@${payload.sender} sizi arıyor...`, true);
      } else if (payload.type === "answer" && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(payload.payload)));
          setCallStatus("Ses Hattı Bağlandı 🟢");
          setIsCallActive(true);

          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
          }
        } catch {}
      } else if (payload.type === "candidate") {
        const candidate = JSON.parse(payload.payload);
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      } else if (payload.type === "end") {
        cleanupCall();
      }
    });

    channel.on("broadcast", { event: "new_chat_msg" }, ({ payload }) => {
      if (!payload) return;
      const cur = activeChatRef.current;

      if (payload.isGroup) {
        saveMessageLocal(username, payload.group_id, true, payload);
        if (groupsRef.current.some((g) => g.id === payload.group_id)) {
          if (cur?.isGroup && cur.id === payload.group_id) setMessages((prev) => [...prev, payload]);
          else triggerPushNotification("👥 Yeni Grup Mesajı", `@${payload.sender}: ${payload.content}`);
        }
      } else if (payload.receiver === username) {
        saveMessageLocal(username, payload.sender, false, payload);
        addChatPartner(payload.sender);
        if (cur && !cur.isGroup && cur.name === payload.sender) {
          setMessages((prev) => [...prev, { ...payload, is_read: true, status: "read" }]);
          if (signalChannelRef.current && !disableReadReceipts) {
            signalChannelRef.current.send({ type: "broadcast", event: "read_receipt", payload: { reader: username, partner: payload.sender } });
          }
        } else {
          triggerPushNotification(`💬 @${payload.sender}`, payload.content);
        }
      }
    });

    channel.on("broadcast", { event: "read_receipt" }, ({ payload }) => {
      if (!payload || payload.partner !== username) return;
      setMessages((prev) => prev.map((m) => (m.sender === username ? { ...m, is_read: true, status: "read" } : m)));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track({ username, online_at: new Date().toISOString(), hideOnline: isHideOnline });
    });

    signalChannelRef.current = channel;
  }

  function sendSignal(receiver: string, type: string, payload: string) {
    if (signalChannelRef.current) {
      signalChannelRef.current.send({ type: "broadcast", event: "signal", payload: { sender: currentUser, receiver, type, payload } });
    }
  }

  function createPeerConnection(targetUser: string) {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    iceCandidatesQueue.current = [];

    pc.onicecandidate = (event) => {
      if (event.candidate && targetUser) sendSignal(targetUser, "candidate", JSON.stringify(event.candidate));
    };

    pc.ontrack = (event) => {
      const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
      setCallStatus("Ses Hattı Bağlandı 🟢");
      setIsCallActive(true);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallStatus("Ses Hattı Bağlandı 🟢");
        setIsCallActive(true);
      } else if (pc.connectionState === "disconnected") {
        setCallStatus("Bağlantı Yenileniyor 🟡");
      }
    };

    return pc;
  }

  async function startCall(video: boolean = false) {
    if (!activeChat || activeChat.isGroup || !currentUser) return;
    const target = activeChat.name;
    currentCallPartnerRef.current = target;

    setIsVideoCall(video);
    setCallModalOpen(true);
    setCallStatus(video ? "Görüntülü aranıyor..." : "Sesli aranıyor...");
    setIsCallActive(false);
    setIsMuted(false);
    setIsSpeakerOff(false);
    setCameraOff(false);

    try {
      const { data } = await supabase.from("call_logs").insert([{ caller: currentUser, receiver: target, call_type: video ? "video" : "audio", status: "calling", created_at: new Date().toISOString() }]).select().single();
      if (data) setCurrentCallLogId(data.id);
    } catch {}

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_PARAMS, video: video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_PARAMS, video: false });
        setIsVideoCall(false);
      } catch {
        return setCallStatus("Mikrofon izni verilmedi!");
      }
    }

    localStreamRef.current = stream;
    setLocalStreamState(stream);
    
    const pc = createPeerConnection(target);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    try {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: video });
      await pc.setLocalDescription(offer);
      sendSignal(target, "offer", JSON.stringify(offer));
    } catch {
      setCallStatus("Arama başlatılamadı.");
    }
  }

  async function acceptCall() {
    if (!incomingCall || !currentUser) return;
    const caller = incomingCall.sender;
    currentCallPartnerRef.current = caller;

    setCallModalOpen(true);
    setCallStatus("Bağlantı Kuruluyor...");
    setIsCallActive(false);
    setIsMuted(false);
    setIsSpeakerOff(false);
    setCameraOff(false);

    if (currentCallLogId) supabase.from("call_logs").update({ status: "answered" }).eq("id", currentCallLogId).then(() => {});

    const isVideo = incomingCall.payload?.includes("m=video") || isVideoCall || false;
    setIsVideoCall(isVideo);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_PARAMS, video: isVideo ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_PARAMS, video: false });
        setIsVideoCall(false);
      } catch {
        return setCallStatus("Mikrofon hatası!");
      }
    }

    localStreamRef.current = stream;
    setLocalStreamState(stream);

    const pc = createPeerConnection(caller);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    try {
      if (incomingCall.payload) {
        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(incomingCall.payload)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(caller, "answer", JSON.stringify(answer));
      }
      setIncomingCall(null);
      setCallStatus("Ses Hattı Bağlandı 🟢");
      setIsCallActive(true);

      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      }
    } catch {
      setCallStatus("Bağlantı kurulamadı.");
    }
  }

  function cleanupCall() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => { t.stop(); t.enabled = false; });
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    iceCandidatesQueue.current = [];
    setLocalStreamState(null);
    setCallModalOpen(false);
    setIncomingCall(null);
    setCallStatus("");
    setIsCallActive(false);
    currentCallPartnerRef.current = null;
    setIsMuted(false);
    setIsSpeakerOff(false);
    setCameraOff(false);

    if (currentCallLogId) {
      supabase.from("call_logs").update({ status: isCallActive ? "ended" : "missed" }).eq("id", currentCallLogId).then(() => {});
      setCurrentCallLogId(null);
    }

    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
    if (dialtoneRef.current) { dialtoneRef.current.pause(); dialtoneRef.current.currentTime = 0; }
    if (remoteAudioRef.current) { remoteAudioRef.current.pause(); remoteAudioRef.current.srcObject = null; }
    if (remoteVideoRef.current) { remoteVideoRef.current.pause(); remoteVideoRef.current.srcObject = null; }
  }

  function endCall(sendEndSignal = true) {
    const target = currentCallPartnerRef.current || (activeChat && !activeChat.isGroup ? activeChat.name : null) || (incomingCall ? incomingCall.sender : null);
    if (sendEndSignal && target && currentUser) sendSignal(target, "end", "{}");
    cleanupCall();
  }

  // ==========================================
  // MESAJ GÖNDERME VE SES KAYDI
  // ==========================================
  async function sendMessage(audioBase64?: string) {
    if (!currentUser || !activeChat) return;
    const isAudio = !!audioBase64;
    const content = isAudio ? audioBase64 : text.trim();
    if (!content) return;
    if (!isAudio) { setText(""); setShowEmojiPicker(false); }

    const isPartnerOnline = !activeChat.isGroup && presenceMap[activeChat.name]?.online;

    const newMsg = {
      sender: currentUser,
      receiver: activeChat.isGroup ? null : activeChat.name,
      group_id: activeChat.isGroup ? activeChat.id : null,
      content,
      message_type: isAudio ? "audio" : "text",
      created_at: new Date().toISOString(),
      isGroup: activeChat.isGroup,
      status: isPartnerOnline ? "delivered" : "sent",
      is_read: false
    };

    setMessages((prev) => [...prev, newMsg]);
    saveMessageLocal(currentUser, activeChat.isGroup ? activeChat.id : activeChat.name, activeChat.isGroup, newMsg);
    if (!activeChat.isGroup) addChatPartner(activeChat.name);

    if (signalChannelRef.current) signalChannelRef.current.send({ type: "broadcast", event: "new_chat_msg", payload: newMsg });

    try {
      if (activeChat.isGroup) {
        await supabase.from("group_messages").insert([{ group_id: activeChat.id, sender: currentUser, content, message_type: isAudio ? "audio" : "text", created_at: newMsg.created_at }]);
      } else {
        await supabase.from("messages").insert([{ sender: currentUser, receiver: activeChat.name, content, message_type: isAudio ? "audio" : "text", status: newMsg.status, is_read: false, created_at: newMsg.created_at }]);
      }
    } catch {}
  }

  async function startRecordingAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_PARAMS });
      audioChunksRef.current = [];
      let options = { mimeType: "audio/webm" };
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) options = { mimeType: "audio/webm;codecs=opus" };
        else if (MediaRecorder.isTypeSupported("audio/mp4")) options = { mimeType: "audio/mp4" };
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => sendMessage(reader.result as string);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch { alert("Mikrofon izni verilmedi!"); }
  }

  function stopRecordingAudio() {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  }

  async function createGroup() {
    if (!newGroupName.trim() || !currentUser) return;
    try {
      const allMembers = Array.from(new Set([currentUser, ...selectedMembers]));
      const { data, error } = await supabase.from("groups").insert([{ name: newGroupName.trim(), created_by: currentUser, members: allMembers, created_at: new Date().toISOString() }]).select().single();
      if (!error && data) {
        setGroups((prev) => [data, ...prev]);
        selectChat({ id: data.id, name: data.name, isGroup: true });
        setCreateGroupModal(false);
        setNewGroupName("");
        setSelectedMembers([]);
      }
    } catch (err: any) { alert("Grup hatası: " + err.message); }
  }

  function toggleMemberSelection(username: string) {
    setSelectedMembers((prev) => prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]);
  }

  function handleLogout() {
    sessionStorage.removeItem("rishyou_username");
    localStorage.removeItem("rishyou_username");
    router.push("/");
  }

  function addStory() {
    if (!newStoryText.trim() || !currentUser) return;
    setStories([{ id: Date.now().toString(), user: currentUser, text: newStoryText.trim(), color: "from-pink-500 to-amber-500" }, ...stories]);
    setNewStoryText("");
    setStoryModalOpen(false);
  }

  const visibleUsers = searchQuery.trim()
    ? users.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : users.filter((u) => {
        const isPartner = activeChatPartners.includes(u.username);
        const isLocked = lockedChats.includes(u.username);
        return tabFilter === "locked" ? isLocked : isPartner && !isLocked;
      });

  const filteredGroups = groups.filter((g) => {
    const matches = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isLocked = lockedChats.includes(`grp_${g.id}`);
    return tabFilter === "locked" ? matches && isLocked : matches && !isLocked;
  });

  const sortedUsers = [...visibleUsers].sort((a, b) => {
    const aPin = pinnedChats.includes(a.username);
    const bPin = pinnedChats.includes(b.username);
    return aPin === bPin ? 0 : aPin ? -1 : 1;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    const aPin = pinnedChats.includes(a.id);
    const bPin = pinnedChats.includes(b.id);
    return aPin === bPin ? 0 : aPin ? -1 : 1;
  });

  const currentChatKey = activeChat ? (activeChat.isGroup ? `grp_${activeChat.id}` : activeChat.name) : "";
  const currentChatTimerHours = currentChatKey ? (chatTimers[currentChatKey] || 0) : 0;

  const displayMessages = messages.filter((m) => {
    if (!currentChatTimerHours || currentChatTimerHours === 0) return true;
    return Date.now() - new Date(m.created_at).getTime() < currentChatTimerHours * 60 * 60 * 1000;
  });

  function getUserOnlineStatus(username: string) {
    const info = presenceMap[username];
    return info && info.online ? { text: "Çevrim İçi 🟢", isOnline: true } : { text: "Çevrim Dışı", isOnline: false };
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[#0e1621] text-gray-200 overflow-hidden font-sans">
      
      {/* SİSTEM SESLERİ VE DOĞRUDAN SES ÇALICI */}
      <audio ref={ringtoneRef} src="https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg" loop className="opacity-0 pointer-events-none absolute w-0 h-0" />
      <audio ref={dialtoneRef} src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" loop className="opacity-0 pointer-events-none absolute w-0 h-0" />
      <audio ref={remoteAudioRef} autoPlay playsInline muted={isSpeakerOff} className="opacity-0 pointer-events-none absolute w-0 h-0" />

      {/* SOL KENAR ÇUBUĞU */}
      <aside className={`flex flex-col w-full md:w-80 lg:w-96 bg-[#17212b] border-r border-[#242f3d] flex-shrink-0 relative ${activeChat ? "hidden md:flex" : "flex"}`}>
        
        <div className="flex items-center justify-between p-3 border-b border-[#242f3d] bg-[#17212b] z-20 gap-1.5">
          <button onClick={() => setDogMenuOpen(!dogMenuOpen)} className="flex items-center gap-2 p-1 rounded-2xl hover:bg-[#242f3d]/80 transition-all active:scale-95 text-left cursor-pointer min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-[#242f3d] border-2 border-[#14F195]/60 flex items-center justify-center shadow-lg relative flex-shrink-0">
              <RishyouDogIcon size={26} />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#17212b] rounded-full ${hideOnline ? "bg-gray-500" : "bg-[#14F195]"}`}></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs text-white tracking-wide truncate">Rishyou</span>
                <span className="text-[8px] bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black px-1 py-0.2 rounded font-black">$RISH</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium block truncate">@{currentUser} ▾</span>
            </div>
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={() => {
                if (!notificationsAllowed) Notification.requestPermission().then((p) => setNotificationsAllowed(p === "granted"));
                else alert("Bildirimler aktif ✔");
              }} 
              title={notificationsAllowed ? "Bildirimler Açık" : "Bildirim İzni Ver"} 
              className={`p-1.5 rounded-xl text-xs transition-all active:scale-90 cursor-pointer ${notificationsAllowed ? "bg-[#242f3d] text-[#14F195]" : "bg-amber-500/20 text-amber-400 animate-pulse"}`}
            >
              🔔
            </button>
            <div className="px-2 py-0.5 rounded-xl bg-[#242f3d] border border-[#14F195]/40 text-[9px] font-bold text-[#14F195] flex flex-col items-center leading-tight"><span>{tpsCount}</span><span className="text-[7px] text-gray-400 font-normal">TPS</span></div>
            <button onClick={() => setStarredModalOpen(true)} title="Yıldızlı Mesajlar" className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-yellow-400 text-xs transition-all active:scale-90 cursor-pointer">⭐</button>
            <button onClick={() => setSettingsModalOpen(true)} title="Ayarlar & Gizlilik" className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-gray-300 text-xs transition-all active:scale-90 cursor-pointer">⚙️</button>
            <button onClick={() => setCreateGroupModal(true)} title="Yeni Özel Grup Kur" className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-[#14F195] text-xs font-bold transition-all active:scale-90 cursor-pointer">👥+</button>
            <button onClick={() => setWalletModalOpen(true)} title="Solana Cüzdanı" className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-[#14F195] text-xs font-bold transition-all active:scale-90 cursor-pointer">💳</button>
          </div>

          {dogMenuOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDogMenuOpen(false)} />
              <div className="absolute top-16 left-3 w-64 bg-[#1e293b] border border-[#14F195]/40 rounded-3xl p-4 shadow-2xl z-50 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-[#242f3d] border border-[#14F195] flex items-center justify-center"><RishyouDogIcon size={20} /></div>
                  <div><h4 className="text-xs font-black text-white truncate">@{currentUser}</h4><p className="text-[10px] text-[#14F195]">Rishyou Web3</p></div>
                </div>
                <button onClick={() => { setSettingsModalOpen(true); setDogMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#242f3d]/70 hover:bg-[#242f3d] text-xs text-white transition-colors cursor-pointer"><span>✏️</span> Ayarlar & Gizlilik</button>
                <button onClick={() => { setLeaderboardModalOpen(true); setDogMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#242f3d]/70 hover:bg-[#242f3d] text-xs text-amber-400 font-bold transition-colors cursor-pointer"><span>🏆</span> Bahşiş Liderleri</button>
                <button onClick={() => { setQrModalOpen(true); setDogMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#242f3d]/70 hover:bg-[#242f3d] text-xs text-white transition-colors cursor-pointer"><span>🎴</span> QR ile Ödeme Al</button>
                <button onClick={() => { setStarredModalOpen(true); setDogMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#242f3d]/70 hover:bg-[#242f3d] text-xs text-white transition-colors cursor-pointer"><span>⭐</span> Yıldızlı Mesajlar</button>
                <button onClick={() => { setVaultModalOpen(true); setDogMenuOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#242f3d]/70 hover:bg-[#242f3d] text-xs text-white transition-colors cursor-pointer"><span>🔒</span> Kaydedilen Notlar (Kasa)</button>
                <button onClick={handleLogout} className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"><span>🚪</span> Hesaptan Çıkış Yap</button>
              </div>
            </>
          )}
        </div>

        <div className="px-3 py-2 border-b border-[#242f3d] flex items-center gap-3 overflow-x-auto">
          <div onClick={() => setStoryModalOpen(true)} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#14F195] p-0.5 flex items-center justify-center bg-[#242f3d] group-hover:scale-105 transition-transform"><span className="text-base text-[#14F195] font-black">+</span></div>
            <span className="text-[10px] text-gray-400 mt-1">Hikayen</span>
          </div>
          {stories.map((s) => (
            <div key={s.id} onClick={() => setActiveStoryView(s)} className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
              <div className="w-11 h-11 rounded-full border-2 border-[#14F195] p-0.5 flex items-center justify-center bg-gradient-to-tr from-[#9945FF] to-[#14F195] group-hover:scale-105 transition-transform"><span className="text-xs font-black text-black">{s.user.slice(0, 2).toUpperCase()}</span></div>
              <span className="text-[10px] text-gray-300 mt-1 truncate max-w-[50px]">@{s.user}</span>
            </div>
          ))}
        </div>

        <div className="p-3 pb-0">
          <div onClick={() => setVaultModalOpen(true)} className="p-3 rounded-2xl bg-[#242f3d]/60 border border-[#14F195]/30 hover:border-[#14F195] cursor-pointer transition-all flex items-center gap-3 shadow-md group">
            <div className="w-9 h-9 rounded-xl bg-[#17212b] flex items-center justify-center text-base shadow border border-white/5">🔒</div>
            <div className="min-w-0 flex-1"><h4 className="text-xs font-bold text-white group-hover:text-[#14F195] transition-colors">Kişisel Kasa</h4><p className="text-[10px] text-gray-400 truncate">Her cihazda eşitlenen özel notlar</p></div>
          </div>
        </div>

        <div className="flex px-3 pt-2.5 gap-1">
          <button onClick={() => setTabFilter("all")} className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${tabFilter === "all" ? "bg-[#14F195] text-black shadow" : "bg-[#242f3d] text-gray-400 hover:text-white"}`}>Tümü</button>
          <button onClick={() => setTabFilter("direct")} className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${tabFilter === "direct" ? "bg-[#14F195] text-black shadow" : "bg-[#242f3d] text-gray-400 hover:text-white"}`}>Gelen</button>
          <button onClick={() => setTabFilter("groups")} className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${tabFilter === "groups" ? "bg-[#14F195] text-black shadow" : "bg-[#242f3d] text-gray-400 hover:text-white"}`}>Gruplar</button>
          <button onClick={() => { if (!isLockedTabUnlocked) setPinPromptModalOpen(true); else setTabFilter("locked"); }} className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${tabFilter === "locked" ? "bg-amber-500 text-black shadow" : "bg-[#242f3d] text-amber-400 hover:text-amber-300"}`} title="PIN Korumalı Gizli Sohbetler"><span>🔒</span><span>Gizli</span></button>
        </div>

        <div className="p-3">
          <div className="relative">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Yeni kişi ara (örn: jokerome)..." className="w-full bg-[#242f3d] border border-gray-700/60 text-xs text-white pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#14F195] placeholder-gray-500" />
            <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
          </div>
        </div>

        {/* LİSTELER */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {(tabFilter === "all" || tabFilter === "groups" || tabFilter === "locked") && sortedGroups.map((g) => {
            const isSelected = activeChat?.isGroup && activeChat.id === g.id;
            const isPinned = pinnedChats.includes(g.id);
            const isLocked = lockedChats.includes(`grp_${g.id}`);
            const hasTimer = (chatTimers[`grp_${g.id}`] || 0) > 0;
            return (
              <div key={`grp_${g.id}`} onClick={() => selectChat({ id: g.id, name: g.name, isGroup: true })} className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? "bg-[#242f3d] border-l-4 border-[#9945FF]" : "hover:bg-[#202b36]"}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#673AB7] flex items-center justify-center font-black text-white text-xs shadow-md flex-shrink-0">👥</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{g.name}</span>
                    <div className="flex items-center gap-1.5">
                      {hasTimer && <span className="text-[10px]" title="Süreli Mesajlar Aktif">⏱️</span>}
                      <button onClick={(e) => toggleLockChat(`grp_${g.id}`, e)} className={`text-[11px] ${isLocked ? "text-amber-400 opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"} transition-opacity hover:scale-125`}>🔒</button>
                      <button onClick={(e) => togglePin(g.id, e)} className={`text-[11px] ${isPinned ? "text-[#14F195] opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"} transition-opacity hover:scale-125`}>📌</button>
                      <span className="text-[9px] bg-[#9945FF]/30 text-[#AB9FF2] px-1.5 py-0.5 rounded font-bold">Özel Grup</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{g.created_by === currentUser ? "Yönetici (Siz)" : `Kurucu: @${g.created_by}`}</p>
                </div>
              </div>
            );
          })}

          {(tabFilter === "all" || tabFilter === "direct" || tabFilter === "locked") && sortedUsers.map((u) => {
            const isSelected = !activeChat?.isGroup && activeChat?.name === u.username;
            const isPinned = pinnedChats.includes(u.username);
            const isLocked = lockedChats.includes(u.username);
            const statusInfo = getUserOnlineStatus(u.username);
            const hasTimer = (chatTimers[u.username] || 0) > 0;
            return (
              <div key={`usr_${u.username}`} onClick={() => selectChat({ id: u.username, name: u.username, isGroup: false })} className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? "bg-[#242f3d] border-l-4 border-[#14F195]" : "hover:bg-[#202b36]"}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center font-black text-black text-xs shadow-md">{u.username.slice(0, 2).toUpperCase()}</div>
                  {statusInfo.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#14F195] border-2 border-[#17212b] rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">@{u.username}</span>
                    <div className="flex items-center gap-1.5">
                      {hasTimer && <span className="text-[10px]" title="Süreli Mesajlar Aktif">⏱️</span>}
                      <button onClick={(e) => toggleLockChat(u.username, e)} className={`text-[11px] ${isLocked ? "text-amber-400 opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"} transition-opacity hover:scale-125`}>🔒</button>
                      <button onClick={(e) => togglePin(u.username, e)} className={`text-[11px] ${isPinned ? "text-[#14F195] opacity-100" : "text-gray-500 opacity-0 group-hover:opacity-100"} transition-opacity hover:scale-125`}>📌</button>
                      <span className={`text-[9px] ${statusInfo.isOnline ? "text-[#14F195] font-bold" : "text-gray-500"}`}>{statusInfo.text}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{u.wallet_address ? `${u.wallet_address.slice(0, 4)}...${u.wallet_address.slice(-4)}` : "Solana Cüzdanı"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* SAĞ SOHBET ALANI */}
      <main className={`flex-1 flex flex-col bg-[#0e1621] relative ${!activeChat ? "hidden md:flex" : "flex"}`}>
        {activeChat ? (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#242f3d] bg-[#17212b]/95 backdrop-blur-md z-10 gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => selectChat(null)} className="md:hidden p-1 -ml-1 text-gray-400 hover:text-white rounded-lg active:bg-gray-800 cursor-pointer flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs shadow-md flex-shrink-0 ${activeChat.isGroup ? "bg-gradient-to-tr from-[#9945FF] to-[#673AB7] text-white" : "bg-gradient-to-tr from-[#9945FF] to-[#14F195] text-black"}`}>
                  {activeChat.isGroup ? "👥" : activeChat.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-white truncate leading-tight">{activeChat.isGroup ? activeChat.name : `@${activeChat.name}`}</h2>
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-[9px] sm:text-[10px] text-[#14F195] truncate">{activeChat.isGroup ? "Gizli Grup" : getUserOnlineStatus(activeChat.name).text}</span>
                    {currentChatTimerHours > 0 && <span className="text-[8px] sm:text-[9px] bg-amber-500/25 text-amber-400 px-1 py-0.1 rounded font-bold flex-shrink-0">⏱️ {currentChatTimerHours === 24 ? "24s" : currentChatTimerHours === 1 ? "1s" : "7g"}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <button onClick={() => setChatTimerModalOpen(true)} title="Sohbet Silme Süresi" className={`p-1 sm:p-1.5 rounded-xl text-xs transition-all active:scale-90 cursor-pointer ${currentChatTimerHours > 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-[#242f3d] hover:bg-[#2b394a] text-gray-300"}`}>⏱️</button>
                <button onClick={() => setVaultModalOpen(true)} title="Kasa" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-xs cursor-pointer">📁</button>
                <button onClick={() => setQrModalOpen(true)} title="QR Kod" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-xs cursor-pointer">🎴</button>
                <button onClick={() => setStarredModalOpen(true)} title="Yıldızlı" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-xs cursor-pointer">⭐</button>
                <button onClick={() => setLeaderboardModalOpen(true)} title="Liderler" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-xs cursor-pointer">🏆</button>
                {!activeChat.isGroup && (
                  <>
                    <button onClick={() => startCall(false)} title="Sesli Arama" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-[#14F195] text-xs transition-all active:scale-90 cursor-pointer">📞</button>
                    <button onClick={() => startCall(true)} title="Görüntülü Arama" className="p-1 sm:p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-[#14F195] text-xs transition-all active:scale-90 cursor-pointer">📹</button>
                  </>
                )}
                <button onClick={() => { setTransferTarget(activeChat.name); setWalletModalOpen(true); }} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black font-black text-[11px] sm:text-xs shadow-md transition-all active:scale-90 flex items-center gap-1 cursor-pointer"><span>💸</span><span className="hidden sm:inline">Bahşiş</span></button>
              </div>
            </div>

            {/* MESAJLAR VE MAVİ TIK SİSTEMİ */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-gradient-to-b from-[#0e1621] to-[#121c27] relative flex flex-col">
              <div className="flex justify-center my-0.5">
                <div className="py-1 px-3 bg-[#1e293b]/90 border border-[#14F195]/30 rounded-full text-[10px] shadow-sm flex items-center gap-2 backdrop-blur-md">
                  <span className="text-white font-bold">SOL: <span className="text-[#14F195] font-black">${solPrice.toFixed(2)}</span></span>
                  <span className="text-emerald-400 font-semibold">{solChange}</span>
                  <span className="text-gray-400">| {tpsCount} TPS</span>
                </div>
              </div>

              {displayMessages.map((m, idx) => {
                const isMe = m.sender === currentUser;
                const isAudio = m.message_type === "audio";
                const isRead = m.is_read || m.status === "read";
                return (
                  <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-3 py-1.5 text-xs shadow-md break-words ${isMe ? "bg-[#2b5278] text-white rounded-br-xs ml-auto" : "bg-[#182533] text-gray-200 rounded-bl-xs mr-auto"}`}>
                      {activeChat.isGroup && !isMe && <p className="text-[10px] font-bold text-[#14F195] mb-0.5">@{m.sender}</p>}
                      {isAudio ? <div className="py-0.5"><audio controls src={m.content} playsInline className="w-[190px] sm:w-[220px] h-8 rounded-lg accent-[#14F195]" /></div> : <p className="leading-relaxed whitespace-pre-wrap text-[12.5px] sm:text-xs">{m.content}</p>}
                      <div className="flex items-center justify-end gap-1 text-[8.5px] sm:text-[9px] text-gray-300/70 mt-0.5">
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isMe && !activeChat.isGroup && (
                          <span className="font-bold">
                            {isRead && !disableReadReceipts ? <span className="text-[#14F195]" title="Okundu (Mavi Tık)">✓✓</span> : m.status === "delivered" ? <span className="text-gray-300" title="İletildi">✓✓</span> : <span className="text-gray-400" title="Gönderildi">✓</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* MESAJ YAZMA ALANI */}
            <div className="p-2 sm:p-3 bg-[#17212b] border-t border-[#242f3d] relative flex-shrink-0">
              {showEmojiPicker && (
                <div className="absolute bottom-[65px] left-3 bg-[#1e293b] border border-gray-600 rounded-2xl p-2.5 shadow-2xl z-50">
                  <div className="grid grid-cols-6 gap-2 text-lg">
                    {["😀","😂","🥰","😎","🤩","😭","😡","🐶","🚀","🔥","💎","💸"].map((emoji) => (
                      <button key={emoji} type="button" onClick={() => setText((prev) => prev + emoji)} className="hover:scale-125 transition-transform cursor-pointer p-1">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-2xl text-base sm:text-lg transition-all active:scale-95 cursor-pointer bg-[#242f3d] text-gray-300 hover:text-[#14F195] flex-shrink-0" title="Emoji & Çıkartma">😊</button>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesajınızı yazın..." className="flex-1 bg-[#242f3d] border border-gray-700/70 text-xs sm:text-sm text-white px-3 py-2 sm:py-2.5 rounded-2xl focus:outline-none focus:border-[#14F195] min-w-0" />
                <button type="button" onClick={isRecordingAudio ? stopRecordingAudio : startRecordingAudio} className={`p-2 sm:p-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex-shrink-0 ${isRecordingAudio ? "bg-red-500 text-white animate-pulse" : "bg-[#242f3d] text-gray-300 hover:text-white"}`} title="Sesli Mesaj">{isRecordingAudio ? "⏹️" : "🎙️"}</button>
                <button type="submit" disabled={!text.trim()} className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#14F195] text-black font-black text-xs sm:text-sm rounded-2xl shadow-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer flex-shrink-0">Gönder</button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-20 h-20 rounded-3xl bg-[#17212b] border border-[#14F195]/20 flex items-center justify-center mb-4 shadow-xl"><RishyouDogIcon size={52} /></div>
            <h3 className="text-base font-bold text-white mb-1">Rishyou Web3 Messenger</h3>
            <p className="text-xs text-gray-500 max-w-xs">Gelen kutunuzdaki bir sohbeti seçin veya yukarıdan kişi arayın.</p>
          </div>
        )}
      </main>

      {/* ARAMA VE GÖRÜŞME EKRANI MODALI */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#17212b] border border-[#14F195]/40 rounded-3xl p-5 text-center space-y-4 shadow-2xl">
            <div className={`relative w-full bg-black rounded-2xl overflow-hidden ${isVideoCall ? "h-64 border border-gray-700" : "hidden"}`}>
              <video ref={remoteVideoRef} autoPlay playsInline muted={isSpeakerOff} className="w-full h-full object-cover" />
              <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-24 h-20 object-cover rounded-xl border-2 border-[#14F195]" />
            </div>
            {!isVideoCall && <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] mx-auto flex items-center justify-center text-3xl shadow-lg animate-pulse">📞</div>}
            <div>
              <h3 className="text-base font-black text-white">@{activeChat?.name || incomingCall?.sender || currentCallPartnerRef.current}</h3>
              <p className="text-xs text-[#14F195] font-mono mt-1 font-bold">{callStatus}</p>
              {isCallActive && <p className="text-xs text-amber-400 font-mono mt-0.5 font-bold">⏱️ {formatCallTime(callDuration)}</p>}
            </div>
            <div className="flex justify-center flex-wrap gap-2 pt-2">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-90 ${isMuted ? "bg-amber-500 text-black" : "bg-[#242f3d] text-white hover:bg-[#324154]"}`}>{isMuted ? "🔇 Mik Aç" : "🎙️ Mik Kapat"}</button>
              <button onClick={() => setIsSpeakerOff(!isSpeakerOff)} className={`p-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-90 ${isSpeakerOff ? "bg-amber-500 text-black" : "bg-[#242f3d] text-white hover:bg-[#324154]"}`}>{isSpeakerOff ? "🔇 Hoparlör Aç" : "🔊 Hoparlör Kapat"}</button>
              {isVideoCall && <button onClick={() => setCameraOff(!cameraOff)} className={`p-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-90 ${cameraOff ? "bg-amber-500 text-black" : "bg-[#242f3d] text-white hover:bg-[#324154]"}`}>{cameraOff ? "📹 Kamera Aç" : "🚫 Kamera Kapat"}</button>}
              <button onClick={() => endCall(true)} className="p-3 px-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black active:scale-95 cursor-pointer shadow-lg shadow-red-500/30">🔴 Sonlandır</button>
            </div>
          </div>
        </div>
      )}

      {/* GELEN ARAMA BİLDİRİMİ */}
      {incomingCall && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-84 z-50 bg-[#17212b] border-2 border-[#14F195] rounded-3xl p-4 shadow-2xl flex items-center justify-between animate-bounce">
          <div><h4 className="text-xs font-black text-white">Gelen Arama</h4><p className="text-xs text-[#14F195] font-bold">@{incomingCall.sender}</p></div>
          <div className="flex gap-2">
            <button onClick={acceptCall} className="py-2 px-3 bg-[#14F195] text-black rounded-xl text-xs font-black cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform">Cevapla</button>
            <button onClick={() => endCall(true)} className="py-2 px-3 bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform">Reddet</button>
          </div>
        </div>
      )}

      {/* PIN GİRİŞ MODALI */}
      {pinPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xs bg-[#17212b] border border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-2xl">🔒</div>
            <h3 className="text-sm font-black text-white">Gizli Sohbet PIN Kilidi</h3>
            <p className="text-xs text-gray-400">Gizli sohbetlerinizi görüntülemek için 4 haneli PIN şifrenizi girin:</p>
            <input type="password" maxLength={4} value={enteredPin} onChange={(e) => setEnteredPin(e.target.value)} placeholder="••••" className="w-full bg-[#242f3d] border border-gray-700 text-center text-xl tracking-widest text-white p-2.5 rounded-xl focus:outline-none focus:border-amber-400" autoFocus />
            <div className="flex gap-2">
              <button onClick={() => { setPinPromptModalOpen(false); setEnteredPin(""); setPendingLockedChat(null); }} className="flex-1 py-2 bg-[#242f3d] text-gray-300 font-bold text-xs rounded-xl cursor-pointer hover:text-white">İptal</button>
              <button onClick={handlePinSubmit} className="flex-1 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer hover:bg-amber-400">Kilidi Aç</button>
            </div>
          </div>
        </div>
      )}

      {/* SOHBETE ÖZEL SÜRELİ MESAJLAR MODALI */}
      {chatTimerModalOpen && activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5"><span>⏱️</span> Süreli Mesajlar ({activeChat.isGroup ? activeChat.name : `@${activeChat.name}`})</h3>
              <button onClick={() => setChatTimerModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <p className="text-[11px] text-gray-400">Bu sohbet için seçilen süreden eski mesajlar otomatik olarak temizlenir. Diğer kişilerle olan konuşmalarınız etkilenmez.</p>
            <div className="space-y-1.5">
              {[
                { label: "Kapalı (Mesajlar Silinmez)", hours: 0 },
                { label: "1 Saat Sonra Sil", hours: 1 },
                { label: "24 Saat Sonra Sil (Önerilen)", hours: 24 },
                { label: "7 Gün Sonra Sil", hours: 168 }
              ].map((opt) => (
                <button key={opt.hours} onClick={() => setAutoDeleteForCurrentChat(opt.hours)} className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${currentChatTimerHours === opt.hours ? "bg-[#14F195] text-black shadow" : "bg-[#242f3d] text-gray-300 hover:bg-[#324154]"}`}>
                  <span>{opt.label}</span>
                  {currentChatTimerHours === opt.hours && <span>✔</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setChatTimerModalOpen(false)} className="w-full py-2 bg-[#242f3d] text-gray-300 font-bold text-xs rounded-xl cursor-pointer hover:text-white">Kapat</button>
          </div>
        </div>
      )}

      {/* AYARLAR VE GİZLİLİK MODALI */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#17212b] border border-gray-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2.5">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5"><span>⚙️</span> Kişisel Ayarlar & Gizlilik</h3>
              <button onClick={() => setSettingsModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <div className="flex bg-[#242f3d] p-1 rounded-xl gap-1 overflow-x-auto">
              <button onClick={() => setSettingsTab("privacy")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-2 ${settingsTab === "privacy" ? "bg-[#14F195] text-black shadow" : "text-gray-400 hover:text-white"}`}>🔒 Gizlilik</button>
              <button onClick={() => setSettingsTab("lang")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-2 ${settingsTab === "lang" ? "bg-[#14F195] text-black shadow" : "text-gray-400 hover:text-white"}`}>🌐 Dil Seçimi</button>
              <button onClick={() => setSettingsTab("sound")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-2 ${settingsTab === "sound" ? "bg-[#14F195] text-black shadow" : "text-gray-400 hover:text-white"}`}>🔔 Ses</button>
              <button onClick={() => setSettingsTab("theme")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-2 ${settingsTab === "theme" ? "bg-[#14F195] text-black shadow" : "text-gray-400 hover:text-white"}`}>🎨 Tema</button>
              <button onClick={() => setSettingsTab("pin")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-2 ${settingsTab === "pin" ? "bg-[#14F195] text-black shadow" : "text-gray-400 hover:text-white"}`}>🛡️ PIN</button>
            </div>
            {settingsTab === "privacy" && (
              <div className="space-y-2">
                <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between text-xs text-gray-200"><span>👤 Çevrim İçi Durumunu Gizle</span><input type="checkbox" checked={hideOnline} onChange={(e) => { setHideOnline(e.target.checked); saveUserSettings({ hideOnline: e.target.checked }); }} className="w-4 h-4 accent-[#14F195] cursor-pointer" /></div>
                <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between text-xs text-gray-200"><span>✔✔ Okundu Bilgisini (Mavi Tık) Kapat</span><input type="checkbox" checked={disableReadReceipts} onChange={(e) => { setDisableReadReceipts(e.target.checked); saveUserSettings({ disableReadReceipts: e.target.checked }); }} className="w-4 h-4 accent-[#14F195] cursor-pointer" /></div>
                <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between text-xs text-gray-200"><span>🛡️ Ekran Görüntüsü Koruması</span><input type="checkbox" checked={screenshotProtection} onChange={(e) => { setScreenshotProtection(e.target.checked); saveUserSettings({ screenshotProtection: e.target.checked }); }} className="w-4 h-4 accent-[#14F195] cursor-pointer" /></div>
              </div>
            )}
            {settingsTab === "lang" && (
              <div className="space-y-1.5">
                {[{ code: "tr", label: "🇹🇷 Türkçe" }, { code: "en", label: "🇬🇧 English" }, { code: "ru", label: "🇷🇺 Русский" }].map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); saveUserSettings({ lang: l.code }); alert(`Dil ${l.label} olarak ayarlandı.`); }} className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${lang === l.code ? "bg-[#14F195] text-black shadow" : "bg-[#242f3d] text-gray-300 hover:bg-[#324154]"}`}>{l.label}</button>
                ))}
              </div>
            )}
            {settingsTab === "sound" && (
              <div className="space-y-2"><div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between text-xs text-gray-200"><span>Mesaj Bildirim ve Arama Sesleri</span><input type="checkbox" checked={soundEnabled} onChange={(e) => { setSoundEnabled(e.target.checked); saveUserSettings({ soundEnabled: e.target.checked }); }} className="w-4 h-4 accent-[#14F195] cursor-pointer" /></div></div>
            )}
            {settingsTab === "theme" && (
              <div className="space-y-2"><p className="text-xs text-gray-400">Vurgu Rengi Seçin:</p><div className="flex gap-2">{["#14F195", "#9945FF", "#3B82F6", "#EC4899", "#F59E0B"].map((c) => (<div key={c} style={{ backgroundColor: c }} className="w-8 h-8 rounded-full cursor-pointer border-2 border-white/30 hover:scale-110 transition-transform" />))}</div></div>
            )}
            {settingsTab === "pin" && (
              <div className="space-y-2 text-xs"><p className="text-gray-400">Uygulama açılışı ve gizli sohbetler için 4 haneli PIN belirleyin:</p><input type="password" maxLength={4} value={appPin} onChange={(e) => { setAppPin(e.target.value); saveUserSettings({ appPin: e.target.value }); }} placeholder="••••" className="w-full bg-[#242f3d] border border-gray-700 text-center text-lg tracking-widest text-white p-2 rounded-xl focus:outline-none focus:border-[#14F195]" /></div>
            )}
            <button onClick={() => setSettingsModalOpen(false)} className="w-full py-2.5 bg-[#14F195] text-black font-black text-xs rounded-xl shadow-lg cursor-pointer">Kaydet ve Kapat</button>
          </div>
        </div>
      )}

      {leaderboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-[#14F195]/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2"><h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5"><span>🏆</span> En Çok Bahşiş Gönderenler</h3><button onClick={() => setLeaderboardModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button></div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between border border-amber-500/30"><span className="font-bold text-white">🥇 @jokerome21</span><span className="text-[#14F195] font-black">15,000 $RISH</span></div>
              <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between border border-gray-700"><span className="font-bold text-white">🥈 @keko21</span><span className="text-[#14F195] font-black">8,500 $RISH</span></div>
              <div className="p-2.5 bg-[#242f3d] rounded-xl flex items-center justify-between border border-gray-700"><span className="font-bold text-white">🥉 @weqwe</span><span className="text-[#14F195] font-black">4,200 $RISH</span></div>
            </div>
            <button onClick={() => setLeaderboardModalOpen(false)} className="w-full py-2 bg-[#14F195] text-black font-bold text-xs rounded-xl cursor-pointer">Kapat</button>
          </div>
        </div>
      )}

      {starredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-gray-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2"><h3 className="text-xs font-black text-white flex items-center gap-1.5"><span>⭐</span> Yıldızlı Mesajlar</h3><button onClick={() => setStarredModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button></div>
            <div className="py-8 text-center text-xs text-gray-500">Henüz yıldızlanmış mesajınız bulunmuyor.</div>
            <button onClick={() => setStarredModalOpen(false)} className="w-full py-2 bg-[#14F195] text-black font-bold text-xs rounded-xl cursor-pointer">Kapat</button>
          </div>
        </div>
      )}

      {vaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#17212b] border border-[#14F195]/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2"><h3 className="text-xs font-black text-white flex items-center gap-1.5"><span>🔒</span> Kişisel Kasa (@{currentUser})</h3><button onClick={() => setVaultModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button></div>
            <div className="space-y-2"><textarea value={newVaultNote} onChange={(e) => setNewVaultNote(e.target.value)} placeholder="Özel şifre veya notunuz..." className="w-full h-20 bg-[#242f3d] border border-gray-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#14F195]" /><button onClick={saveVaultNote} className="w-full py-2 bg-[#14F195] text-black font-bold text-xs rounded-xl shadow-md cursor-pointer active:scale-95">Kasaya Ekle</button></div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2">
              {vaultNotes.map((n, idx) => (
                <div key={idx} className="p-2.5 bg-[#242f3d] rounded-xl text-xs text-gray-200 border border-white/5 break-words flex justify-between items-center"><span>{n}</span><button onClick={() => { navigator.clipboard.writeText(n); alert("Kopyalandı!"); }} className="text-[10px] text-[#14F195] font-bold ml-2 cursor-pointer">Kopyala</button></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#17212b] border border-[#14F195]/40 rounded-3xl p-5 shadow-2xl text-center space-y-3">
            <h3 className="text-xs font-black text-white">QR ile Solana / $RISH Al</h3>
            <div className="w-44 h-44 bg-white p-2 mx-auto rounded-2xl flex items-center justify-center shadow-inner"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${walletAddress || "solana"}`} alt="QR" className="w-full h-full" /></div>
            <p className="text-[10px] text-gray-400 font-mono break-all select-all">{walletAddress}</p>
            <button onClick={() => setQrModalOpen(false)} className="w-full py-2 bg-[#14F195] text-black font-bold text-xs rounded-xl cursor-pointer">Kapat</button>
          </div>
        </div>
      )}

      {storyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-[#14F195]/40 rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-xs font-black text-white">Hikaye Ekle</h3>
            <textarea value={newStoryText} onChange={(e) => setNewStoryText(e.target.value)} placeholder="Hikayenizde ne paylaşmak istersiniz?" className="w-full h-24 bg-[#242f3d] border border-gray-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#14F195]" />
            <button onClick={addStory} disabled={!newStoryText.trim()} className="w-full py-2.5 bg-[#14F195] text-black font-black text-xs rounded-xl cursor-pointer">Paylaş</button>
          </div>
        </div>
      )}

      {activeStoryView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setActiveStoryView(null)}>
          <div className={`w-full max-w-xs h-96 bg-gradient-to-tr ${activeStoryView.color} rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative border-2 border-white/20`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/20 pb-3"><span className="text-xs font-black text-white">@{activeStoryView.user}</span><button onClick={() => setActiveStoryView(null)} className="text-white text-xs font-bold cursor-pointer">✕</button></div>
            <p className="text-base font-bold text-white text-center drop-shadow-md">{activeStoryView.text}</p>
            <div className="text-[10px] text-white/70 text-center">Rishyou Story</div>
          </div>
        </div>
      )}

      {createGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-gray-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-2.5"><h3 className="text-sm font-black text-white flex items-center gap-1.5"><span>👥</span> Yeni Özel Grup Kur</h3><button onClick={() => setCreateGroupModal(false)} className="text-gray-400 hover:text-white text-sm cursor-pointer">✕</button></div>
            <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Grup Adı" className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-[#14F195]" />
            <div>
              <p className="text-[11px] text-gray-400 mb-1 font-bold">Gruba Dahil Edilecek Kişileri Seçin:</p>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-[#242f3d]/50 p-2 rounded-xl border border-gray-700/60">
                {users.map((u) => (
                  <div key={u.username} onClick={() => toggleMemberSelection(u.username)} className={`p-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${selectedMembers.includes(u.username) ? "bg-[#14F195]/20 text-[#14F195] font-bold" : "hover:bg-[#242f3d] text-gray-300"}`}>
                    <span>@{u.username}</span>
                    <span>{selectedMembers.includes(u.username) ? "✔ Seçildi" : "+ Ekle"}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={createGroup} disabled={!newGroupName.trim()} className="w-full py-2.5 bg-[#14F195] text-black font-black text-xs rounded-xl cursor-pointer disabled:opacity-40">Grubu Oluştur</button>
          </div>
        </div>
      )}

      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17212b] border border-gray-700 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2"><h3 className="text-xs font-black text-white">Solana Cüzdanı</h3><button onClick={() => setWalletModalOpen(false)} className="text-gray-400 hover:text-white text-xs cursor-pointer">✕</button></div>
            <div className="p-3 bg-[#242f3d] rounded-2xl space-y-1 text-xs"><div className="flex justify-between"><span>SOL:</span><span className="font-bold text-white">{solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "0.00 SOL"}</span></div><div className="flex justify-between"><span>$RISH:</span><span className="font-black text-[#14F195]">{rishBalance.toLocaleString()} $RISH</span></div></div>
            <input type="text" value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} placeholder="Alıcı kullanıcı adı" className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white p-2 rounded-xl focus:outline-none focus:border-[#14F195]" />
            <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="Miktar ($RISH)" className="w-full bg-[#242f3d] border border-gray-700 text-xs text-white p-2 rounded-xl focus:outline-none focus:border-[#14F195]" />
            <button onClick={() => { setRishBalance((prev) => Math.max(0, prev - Number(transferAmount))); setTxStatus("Transfer Başarılı!"); }} className="w-full py-2.5 bg-[#14F195] text-black font-black text-xs rounded-xl cursor-pointer">Transfer Et</button>
            {txStatus && <p className="text-[10px] text-center text-[#14F195]">{txStatus}</p>}
          </div>
        </div>
      )}

    </div>
  );
}