import express from "express";
import { config } from "../../config.js";
import gplay from "google-play-scraper";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?q=appname"
  });
  }

  try {
    const results = await gplay.search({
      term: q,
      num: 10,
      country: "sa",  
      lang: "en"
    });

    const apps = results.map(app => ({
      title: app.title,
      developer: app.developer,
      rating: app.score,
      installs: app.installs,
      icon: app.icon,
      link: app.url,
      appId: app.appId
    }));

    res.json({
      status: true,
      creator: config.author,
      total: apps.length,
      data: apps
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      creator: config.author,
      message: "Error fetching Play Store data",
      error: error.message
    });
  }
});

export default router;