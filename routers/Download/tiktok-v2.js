import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط تيك توك في الباراميتر url"
  });
    }

    try {
        const body = qs.stringify({
            id: videoUrl,
            locale: "en",
            tt: "dH16Y1g4",
        });

        const ass = axios.post;

        const response = await ass("https://ssstik.io/abc?url=dl", body, {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(response.data);
        const downloads = [];

        $(".download_link").each((i, el) => {
            const url = $(el).attr("href");
            const text = $(el).text().trim();
            if (url) {
                downloads.push({
                    title: text,
                    url: url.startsWith("http") ? url : `https://ssstik.io${url}`
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
