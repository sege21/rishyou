self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const isCall = data.type === "call";
    const isMissed = data.type === "missed";
    
    const options = {
      body: data.body || "Rishyou Web3 Bildirimi",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: isCall ? [600, 250, 600, 250, 1000, 300, 1000] : isMissed ? [300, 150, 300] : [200, 100, 200],
      tag: isCall ? "incoming-call-lockscreen" : isMissed ? "missed-call" : "chat-msg",
      renotify: true,
      requireInteraction: isCall,
      actions: isCall ? [
        { action: "answer", title: "📞 Cevapla" },
        { action: "reject", title: "❌ Reddet" }
      ] : [],
      data: { url: data.url || "/chat", caller: data.caller, callId: data.callId }
    };

    event.waitUntil(self.registration.showNotification(data.title || "Rishyou Web3", options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/chat";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes("/chat") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});