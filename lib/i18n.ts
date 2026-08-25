export type Language = "tr" | "en" | "ru" | "de" | "es" | "fr" | "ar" | "zh";

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" }
];

export const DICTIONARY: Record<Language, Record<string, string>> = {
  tr: {
    all: "Tümü", direct: "Kişiler", groups: "Gruplar", searchPlaceholder: "Kişi veya grup ara...",
    globalSearchPlaceholder: "Yeni kullanıcı veya grup ara...", yourStory: "Hikayen", addStory: "Hikaye Ekle",
    storyTextPlaceholder: "Hikayenizde ne paylaşmak istersiniz?", shareStory: "Hikayeyi Paylaş",
    settings: "Ayarlar", language: "Dil Değiştir", vault: "Kasa (Notlar)",
    vaultPlaceholder: "Özel şifre veya gizli tohum kelimelerinizi buraya yazın...", saveVault: "Kasaya Kaydet",
    copy: "Kopyala", copied: "Panoya Kopyalandı!", wallet: "Solana Cüzdanı", solBalance: "SOL Bakiye",
    rishBalance: "$RISH Bakiye", tip: "Bahşiş", sendTip: "$RISH Transfer Et", logout: "Çıkış Yap",
    sendMessage: "Mesajınızı yazın...", send: "Gönder", voiceNote: "Sesli Mesaj", online: "Çevrim İçi",
    offline: "Çevrim Dışı", groupChat: "Grup Sohbeti", call: "Sesli Arama", videoCall: "Görüntülü Arama",
    calling: "Arama yapılıyor...", connected: "Bağlandı (Aktif)", createGroup: "Yeni Grup Oluştur",
    groupName: "Grup Adı", groupNamePlaceholder: "Örn: Solana Alpha Club", addMembers: "Üye Ekle",
    create: "Oluştur", endCall: "Sonlandır", mute: "Sessiz", unmute: "Sesi Aç", camOff: "Kamera Kapat",
    camOn: "Kamera Aç", swapScreen: "Ekranı Değiştir", shareScreen: "Ekran Paylaş", stopShare: "Paylaşımı Durdur",
    addPerson: "+ Kişi Ekle", incomingCall: "Gelen Arama", answer: "Cevapla", decline: "Reddet",
    noChatsYet: "Henüz bir sohbetiniz yok. Üstteki arama çubuğundan kullanıcı arayıp mesaj gönderebilirsiniz!",
    marketPrices: "Canlı Piyasa"
  },
  en: {
    all: "All", direct: "Direct", groups: "Groups", searchPlaceholder: "Search chats...",
    globalSearchPlaceholder: "Search new user or group...", yourStory: "Your Story", addStory: "Add Story",
    storyTextPlaceholder: "What's on your mind?", shareStory: "Share Story", settings: "Settings",
    language: "Change Language", vault: "Vault (Notes)", vaultPlaceholder: "Save secret keys...",
    saveVault: "Save to Vault", copy: "Copy", copied: "Copied!", wallet: "Solana Wallet",
    solBalance: "SOL Balance", rishBalance: "$RISH Balance", tip: "Tip", sendTip: "Transfer $RISH",
    logout: "Log Out", sendMessage: "Type a message...", send: "Send", voiceNote: "Voice Note",
    online: "Online", offline: "Offline", groupChat: "Group Chat", call: "Voice Call",
    videoCall: "Video Call", calling: "Calling...", connected: "Connected", createGroup: "Create Group",
    groupName: "Group Name", groupNamePlaceholder: "e.g. Solana Alpha", addMembers: "Add Members",
    create: "Create", endCall: "End Call", mute: "Mute", unmute: "Unmute", camOff: "Camera Off",
    camOn: "Camera On", swapScreen: "Swap Screen", shareScreen: "Share Screen", stopShare: "Stop Sharing",
    addPerson: "+ Add User", incomingCall: "Incoming Call", answer: "Answer", decline: "Decline",
    noChatsYet: "No chats yet. Search a user above!", marketPrices: "Live Market"
  },
  ru: {
    all: "Все", direct: "Личные", groups: "Группы", searchPlaceholder: "Поиск...",
    globalSearchPlaceholder: "Найти...", yourStory: "История", addStory: "Добавить",
    storyTextPlaceholder: "Чем поделиться?", shareStory: "Опубликовать", settings: "Настройки",
    language: "Сменить язык", vault: "Хранилище", vaultPlaceholder: "Заметки...",
    saveVault: "Сохранить", copy: "Копировать", copied: "Скопировано!", wallet: "Кошелек",
    solBalance: "SOL Баланс", rishBalance: "$RISH Баланс", tip: "Чаевые", sendTip: "Перевести",
    logout: "Выйти", sendMessage: "Сообщение...", send: "Отправить", voiceNote: "Голосовое",
    online: "В сети", offline: "Не в сети", groupChat: "Группа", call: "Звонок",
    videoCall: "Видеозвонок", calling: "Вызов...", connected: "Подключено", createGroup: "Создать группу",
    groupName: "Название", groupNamePlaceholder: "Имя группы", addMembers: "Участники",
    create: "Создать", endCall: "Завершить", mute: "Выкл. звук", unmute: "Вкл. звук",
    camOff: "Выкл. камеру", camOn: "Вкл. камеру", swapScreen: "Сменить экран", shareScreen: "Экран",
    stopShare: "Стоп", addPerson: "+ Добавить", incomingCall: "Входящий вызов", answer: "Ответить",
    decline: "Отклонить", noChatsYet: "Нет чатов.", marketPrices: "Рынок"
  },
  de: { all: "Alle", direct: "Direkt", groups: "Gruppen", searchPlaceholder: "Suchen...", globalSearchPlaceholder: "Benutzer suchen...", yourStory: "Story", addStory: "Hinzufügen", storyTextPlaceholder: "Was gibt's Neues?", shareStory: "Teilen", settings: "Einstellungen", language: "Sprache ändern", vault: "Tresor", vaultPlaceholder: "Notizen...", saveVault: "Speichern", copy: "Kopieren", copied: "Kopiert!", wallet: "Wallet", solBalance: "SOL", rishBalance: "$RISH", tip: "Trinkgeld", sendTip: "Senden", logout: "Abmelden", sendMessage: "Nachricht...", send: "Senden", voiceNote: "Sprachnachricht", online: "Online", offline: "Offline", groupChat: "Gruppe", call: "Anruf", videoCall: "Video", calling: "Ruft...", connected: "Verbunden", createGroup: "Gruppe erstellen", groupName: "Name", groupNamePlaceholder: "Name", addMembers: "Mitglieder", create: "Erstellen", endCall: "Auflegen", mute: "Stumm", unmute: "Laut", camOff: "Kamera aus", camOn: "Kamera an", swapScreen: "Tauschen", shareScreen: "Teilen", stopShare: "Stoppen", addPerson: "+ Person", incomingCall: "Anruf", answer: "Annehmen", decline: "Ablehnen", noChatsYet: "Keine Chats.", marketPrices: "Markt" },
  es: { all: "Todos", direct: "Directos", groups: "Grupos", searchPlaceholder: "Buscar...", globalSearchPlaceholder: "Buscar usuario...", yourStory: "Historia", addStory: "Añadir", storyTextPlaceholder: "¿Qué pasa?", shareStory: "Compartir", settings: "Ajustes", language: "Cambiar idioma", vault: "Bóveda", vaultPlaceholder: "Notas...", saveVault: "Guardar", copy: "Copiar", copied: "¡Copiado!", wallet: "Billetera", solBalance: "SOL", rishBalance: "$RISH", tip: "Propina", sendTip: "Enviar", logout: "Salir", sendMessage: "Mensaje...", send: "Enviar", voiceNote: "Voz", online: "En línea", offline: "Desconectado", groupChat: "Grupo", call: "Llamada", videoCall: "Videollamada", calling: "Llamando...", connected: "Conectado", createGroup: "Crear grupo", groupName: "Nombre", groupNamePlaceholder: "Nombre", addMembers: "Miembros", create: "Crear", endCall: "Colgar", mute: "Silenciar", unmute: "Activar", camOff: "Cámara off", camOn: "Cámara on", swapScreen: "Cambiar", shareScreen: "Pantalla", stopShare: "Detener", addPerson: "+ Añadir", incomingCall: "Llamada entrante", answer: "Responder", decline: "Rechazar", noChatsYet: "Sin chats.", marketPrices: "Mercado" },
  fr: { all: "Tous", direct: "Direct", groups: "Groupes", searchPlaceholder: "Recherche...", globalSearchPlaceholder: "Rechercher...", yourStory: "Story", addStory: "Ajouter", storyTextPlaceholder: "Quoi de neuf?", shareStory: "Partager", settings: "Paramètres", language: "Changer de langue", vault: "Coffre", vaultPlaceholder: "Notes...", saveVault: "Enregistrer", copy: "Copier", copied: "Copié!", wallet: "Portefeuille", solBalance: "SOL", rishBalance: "$RISH", tip: "Pourboire", sendTip: "Envoyer", logout: "Déconnexion", sendMessage: "Message...", send: "Envoyer", voiceNote: "Vocal", online: "En ligne", offline: "Hors ligne", groupChat: "Groupe", call: "Appel", videoCall: "Vidéo", calling: "Appel...", connected: "Connecté", createGroup: "Créer groupe", groupName: "Nom", groupNamePlaceholder: "Nom", addMembers: "Membres", create: "Créer", endCall: "Raccrocher", mute: "Muet", unmute: "Son", camOff: "Cam off", camOn: "Cam on", swapScreen: "Changer", shareScreen: "Écran", stopShare: "Arrêter", addPerson: "+ Ajouter", incomingCall: "Appel entrant", answer: "Répondre", decline: "Refuser", noChatsYet: "Pas de discussion.", marketPrices: "Marché" },
  ar: { all: "الكل", direct: "مباشر", groups: "مجموعات", searchPlaceholder: "بحث...", globalSearchPlaceholder: "بحث...", yourStory: "قصتك", addStory: "إضافة", storyTextPlaceholder: "ماذا يدور في ذهنك؟", shareStory: "نشر", settings: "الإعدادات", language: "تغيير اللغة", vault: "الخزنة", vaultPlaceholder: "ملاحظات...", saveVault: "حفظ", copy: "نسخ", copied: "تم النسخ!", wallet: "محفظة", solBalance: "SOL", rishBalance: "$RISH", tip: "إكرامية", sendTip: "إرسال", logout: "خروج", sendMessage: "رسالة...", send: "إرسال", voiceNote: "صوتية", online: "متصل", offline: "غير متصل", groupChat: "مجموعة", call: "اتصال", videoCall: "فيديو", calling: "اتصال...", connected: "متصل", createGroup: "إنشاء مجموعة", groupName: "اسم", groupNamePlaceholder: "اسم", addMembers: "أعضاء", create: "إنشاء", endCall: "إنهاء", mute: "كتم", unmute: "صوت", camOff: "إيقاف", camOn: "تشغيل", swapScreen: "تبديل", shareScreen: "شاشة", stopShare: "إيقاف", addPerson: "+ إضافة", incomingCall: "مكالمة واردة", answer: "رد", decline: "رفض", noChatsYet: "لا محادثات.", marketPrices: "السوق" },
  zh: { all: "全部", direct: "私聊", groups: "群组", searchPlaceholder: "搜索...", globalSearchPlaceholder: "搜索用户...", yourStory: "动态", addStory: "发布", storyTextPlaceholder: "分享...", shareStory: "发布", settings: "设置", language: "切换语言", vault: "保险箱", vaultPlaceholder: "便签...", saveVault: "保存", copy: "复制", copied: "已复制!", wallet: "钱包", solBalance: "SOL", rishBalance: "$RISH", tip: "打赏", sendTip: "转账", logout: "退出", sendMessage: "消息...", send: "发送", voiceNote: "语音", online: "在线", offline: "离线", groupChat: "群聊", call: "通话", videoCall: "视频", calling: "呼叫...", connected: "已连接", createGroup: "创建群组", groupName: "名称", groupNamePlaceholder: "名称", addMembers: "成员", create: "创建", endCall: "挂断", mute: "静音", unmute: "取消静音", camOff: "关摄像头", camOn: "开摄像头", swapScreen: "切换", shareScreen: "共享", stopShare: "停止", addPerson: "+ 添加", incomingCall: "来电", answer: "接听", decline: "拒绝", noChatsYet: "暂无记录。", marketPrices: "行情" }
};

export function t(key: string, lang: Language = "tr"): string {
  return DICTIONARY[lang]?.[key] || DICTIONARY["en"]?.[key] || key;
}