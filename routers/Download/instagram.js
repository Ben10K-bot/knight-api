import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط انستجرام في الباراميتر url"
  });
    }

    try {
        const cleanUrl = encodeURIComponent(videoUrl);
        const apiUrl = `https://www.emam-api.web.id/home/sections/Download/api/Instagram/ajax?url=${cleanUrl}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = response.data;

        if (data && data.status === true) {
            const downloads = data.data.map(item => ({
                type: item.title.includes('Video') ? 'video' : 'thumbnail',
                title: item.title,
                url: item.url
            }));

            res.json({
                status: true,
                creator: config.author || "dev.knight",
                result: downloads
            });
        } else {
            res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "تعذر العثور على روابط تحميل، تأكد أن الفيديو عام وغير محذوف."
  });
        }

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "فشل الاتصال بسيرفر التحميل الخارجي",
            error: err.message
        });
    }
});

export default router;