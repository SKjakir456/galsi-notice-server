self.addEventListener("push", event => {
  if (!event.data) return;

  const data = event.data.json();

  self.registration.showNotification(data.title || "Galsi Mahavidyalaya", {
    body: data.body || "New notice available",
    icon: "/icon.png",
    badge: "/icon.png"
  });
});
