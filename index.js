import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Galsi Notice Server is running");
});

const URL = "https://galsimahavidyalaya.ac.in/category/notice/";

app.get("/notices", async (req, res) => {
  try {
    const { data } = await axios.get(URL);
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

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
