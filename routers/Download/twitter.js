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
            message: "الرجاء توفير رابط تويتر (X) في الباراميتر url" 
        });
    }

    try {
        const info = await ytdlp(videoUrl, {
            dumpJson: true,
            noWarnings: true,
            noCallHome: true,
        });

        const formats = info.formats
            .filter(f => f.vcodec !== 'none' && f.url && f.protocol === 'https')
            .map(f => ({
                quality: f.format_note || `${f.width}x${f.height}`,
                extension: f.ext,
                size: f.filesize_approx ? (f.filesize_approx / (1024 * 1024)).toFixed(2) + " MB" : "N/A",
                url: f.url
            }))
            .reverse(); 
        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result: {
                metadata: {
                    title: info.title || info.fulltitle || "Twitter Video",
                    thumbnail: info.thumbnail,
                    duration: info.duration_string,
                    views: info.view_count || 0,
                    likes: info.like_count || 0,
                    date: info.upload_date
                },
                author: {
                    name: info.uploader,
                    username: `@${info.uploader_id}`,
                    avatar: info.uploader_url 
                },
                download: {
                    video_hd: formats[0]?.url || null,
                    all_formats: formats
                }
            }
        });

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "تعذر جلب البيانات. قد يكون الحساب خاصاً أو الفيديو محذوفاً.",
            error: err.message
        });
    }
});

export default router;