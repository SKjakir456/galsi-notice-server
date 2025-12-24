import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

const COLLEGE_NOTICE_URL =
  "https://galsimahavidyalaya.ac.in/category/notice/";

app.get("/notices", async (req, res) => {
  try {
    const { data } = await axios.get(COLLEGE_NOTICE_URL);
    const $ = cheerio.load(data);

    const notices = [];

    $("table tbody tr").each((i, el) => {
      if (i >= 3) return false; // only latest 3

      const date = $(el).find("td").eq(1).text().trim();
      const title = $(el).find("td").eq(2).text().trim();
      const link = $(el).find("a").attr("href");

      notices.push({ date, title, link });
    });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

app.listen(3000, () =>
  console.log("Notice server running on http://localhost:3000")
);
