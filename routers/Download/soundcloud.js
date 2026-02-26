import express from 'express';
import ytdlp from 'yt-dlp-exec';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط ساوند كلاود في الباراميتر url"
  });
    }

    try {
        const info = await ytdlp(url, {
            dumpJson: true,
            noWarnings: true,
            noCallHome: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });
        if (info && info.url) {
            res.json({
                status: true,
                creator: config.author || "dev.knight",
                result: [{
                    title: info.title,
                    thumbnail: info.thumbnail,
                    duration: info.duration_string,
                    uploader: info.uploader,
                    url: info.url 
                }]
            });
        } else {
            res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "تعذر استخراج رابط التحميل من هذا الرابط."
  });
        }

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "حدث خطأ أثناء معالجة الرابط عبر yt-dlp",
            error: err.message
        });
    }
});

export default router;