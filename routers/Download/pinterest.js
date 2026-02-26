import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
import https from 'https';
import { config } from '../../config.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط بينترست في الباراميتر url"
  });
    }

    try {
        const body = qs.stringify({
            url: url
        });

        const httpsAgent = new https.Agent({  
            rejectUnauthorized: false
        });

        const ass = axios.post;

        const response = await ass("https://pinterestvideodownloader.com/download.php", body, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "content-type": "application/x-www-form-urlencoded",
                "origin": "https://pinterestvideodownloader.com",
                "referer": "https://pinterestvideodownloader.com/en/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            httpsAgent: httpsAgent,
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const downloads = [];
        $("a.more-link").each((i, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().toLowerCase();
            
            if (href && href.startsWith("http") && !text.includes("other")) {
                if (text.includes("video")) {
                    downloads.push({
                        type: "video",
                        url: href
                    });
                } else if (text.includes("image")) {
                    downloads.push({
                        type: "image",
                        url: href
                    });
                }
            }
        });

        if (downloads.length === 0) {
            $("img").each((i, el) => {
                const src = $(el).attr("src");
                if (src && src.includes("pinimg.com")) {
                    downloads.push({
                        type: "image",
                        url: src
                    });
                }
            });
        }

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
