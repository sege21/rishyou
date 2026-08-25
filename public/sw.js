self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "Yeni bir bildiriminiz var.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200, 100, 200],
      data: { url: data.url || "/chat" }
    };
    event.waitUntil(self.registration.showNotification(data.title || "Rishyou Web3", options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/chat"));
});