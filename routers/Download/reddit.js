import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط ريديت في الباراميتر url"
  });
    }

    try {
        const response = await axios.get(`https://redditsave.com/info?url=${encodeURIComponent(url)}`, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(response.data);
        const downloads = [];

        $(".downloadbutton").each((i, el) => {
            const downloadUrl = $(el).attr("href");
            const quality = $(el).text().trim();
            if (downloadUrl) {
                downloads.push({
                    quality: quality,
                    url: downloadUrl.startsWith("http") ? downloadUrl : `https://redditsave.com${downloadUrl}`
                });
            }
        });

        if (downloads.length > 0) {
            res.json({
                status: true,
                creator: config.author || "dev.knight",
                result: downloads
            });
        } else {
            res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "تعذر العثور على روابط تحميل."
  });
        }

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "فشل الاتصال بسيرفر التحميل",
            error: err.message
        });
    }
});

export default router;
