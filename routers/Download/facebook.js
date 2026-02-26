import express from 'express';
import ytdlp from 'yt-dlp-exec';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط Facebook Reel في الباراميتر url"
  });
    }

    try {
        const info = await ytdlp(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true
        });

        if (!info || !info.formats) {
            return res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "تعذر استخراج بيانات الفيديو"
  });
        }

        const videos = info.formats
            .filter(f => f.ext === "mp4" && f.vcodec !== "none")
            .sort((a, b) => (b.height || 0) - (a.height || 0));

        const best = videos[0]?.url || null;
        const hd = videos.find(f => f.height >= 720)?.url || null;
        const sd = videos[videos.length - 1]?.url || null;

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            uploader: info.uploader,
            urls: {
                sd,
                hd,
                best
            }
        });

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "فشل استخراج الفيديو",
            error: err.message
        });
    }
});

export default router;
