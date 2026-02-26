import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query parameter ?q=game-name"
  });
  }

  try {
    const url = `https://store.steampowered.com/search/suggest?term=${encodeURIComponent(q)}&f=games&cc=US`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    const results = [];

    $(".match").each((_, el) => {
      let priceText = $(el).find(".match_price").text().trim();
      if (priceText === "") {
        priceText = "Free";
      }
      results.push({
        appId: $(el).attr("data-ds-appid"),
        title: $(el).find(".match_name").text().trim(),
        price: priceText,
        image: $(el).find("img").attr("src"),
        url: $(el).attr("href")
      });
    });

    res.json({
      status: true,
      creator: config.author,
      results: results
    });

  } catch (err) {
    res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
  }
});

export default router;