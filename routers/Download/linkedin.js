import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط LinkedIn في الباراميتر url"
  });
    }

    try {
        const apiUrl = `https://api.blabigo.com/api/free-tools/video-downloader?url=${encodeURIComponent(url)}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                'Referer': 'https://blabigo.com/',
                'Origin': 'https://blabigo.com'
            }
        });

        const videoUrl = response.data.result;

        if (videoUrl && typeof videoUrl === 'string') {
            res.json({
                status: true,
                creator: config.author || "dev.knight",
                result:{url: videoUrl}
            });
        } else {
            res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "تعذر استخراج رابط الفيديو من الرد."
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