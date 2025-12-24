import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import webpush from "web-push";

const app = express();

/* ================== GLOBAL STATE ================== */
let lastNoticeLink = null;
const subscriptions = [];

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json()); // REQUIRED for POST body

/* ================== VAPID ================== */
webpush.setVapidDetails(
  "mailto:jakir.work@gmail.com",
  "BD131CzVAY3DOY529GcBnb8xr7MdZlYu6Wtqgk0KamgAXz0ISjfz2Zjh3AVmGr-kifZS3tntsbuaL69b_qmF6pE",
  "7AwksgCAnHJ1cNuXaydGjGpTMvAFx4O0QXF5HFwclaM"
);

/* ================== BASIC ROUTE ================== */
app.get("/", (req, res) => {
  res.send("Galsi Notice Server is running");
});

/* ================== PUSH SENDER ================== */
async function sendPushToAll(title) {
  const payload = JSON.stringify({
    title: "New College Notice",
    body: title
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error("Push failed:", err.message);
    }
  }
}

/* ================== SCRAPER ================== */
const NOTICE_URL = "https://galsimahavidyalaya.ac.in/category/notice/";

app.get("/notices", async (req, res) => {
  try {
    const { data } = await axios.get(NOTICE_URL);
    const $ = cheerio.load(data);

    const notices = [];

    $("table tbody tr").each((i, el) => {
      if (i >= 3) return false;

      const tds = $(el).find("td");
      const date = tds.eq(1).text().trim();
      const title = tds.eq(2).text().trim();
      const link = $(el).find("a").attr("href");

      notices.push({ date, title, link });
    });

    /* ---------- AUTO PUSH LOGIC ---------- */
    if (notices.length > 0) {
      const latest = notices[0];

      if (lastNoticeLink !== latest.link) {
        lastNoticeLink = latest.link;
        console.log("🔔 New notice detected:", latest.title);

        if (subscriptions.length > 0) {
          await sendPushToAll(latest.title);
          console.log("📤 Push sent to subscribers");
        }
      }
    }

    res.json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

/* ================== PUSH SUBSCRIBE ================== */
app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  const exists = subscriptions.find(
    sub => sub.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
    console.log("✅ New push subscriber added");
  }

  res.status(201).json({ success: true });
});

/* ================== START SERVER ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
