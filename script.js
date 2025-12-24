function checkRSS() {
  fetch(API)
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("noticeList");
      if (!data.items || data.items.length === 0) return;

      const latest3 = data.items.slice(0, 3);
      const lastSeen = localStorage.getItem("lastNotice");

      list.innerHTML = "";

      latest3.forEach(item => {
        const div = document.createElement("div");
        div.className = "glass";
        div.style.padding = "12px";
        div.style.marginBottom = "10px";
        div.innerHTML = `
          <strong>${item.title}</strong><br>
          <small>${new Date(item.pubDate).toDateString()}</small>
        `;
        list.appendChild(div);
      });

      badge.innerText = latest3.length;

      if (lastSeen !== latest3[0].link) {
        localStorage.setItem("lastNotice", latest3[0].link);

        showNotification("New Notice", latest3[0].title);

        // Browser notification (optional, see next step)
        sendBrowserNotification(latest3[0].title);
      }
    })
    .catch(() => {
      document.getElementById("noticeList").innerHTML =
        "<p>Unable to load notices</p>";
    });
}

/* First load */
checkRSS();

/* Auto-check every 5 minutes */
setInterval(checkRSS, 5 * 60 * 1000);
