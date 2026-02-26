import express from 'express';
import ytdlp from 'yt-dlp-exec';
import SpotifyUrlInfo from 'spotify-url-info';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();
const getData = SpotifyUrlInfo(fetch);

router.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "الرجاء توفير رابط Spotify في الباراميتر url"
        });
    }

    try {
        const data = await getData.getData(url);
        const searchQuery = `${data.name} ${data.artists.map(a => a.name).join(' ')}`;

        const info = await ytdlp(`ytsearch1:${searchQuery}`, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true
        });

        const video = info.entries ? info.entries[0] : info;

        if (!video || !video.formats) {
            return res.status(500).json({
                status: false,
                creator: config.author || "dev.knight",
                message: "لم يتم العثور على فيديو مناسب"
            });
        }

        const audioFormat = video.formats
            .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

        if (!audioFormat) {
            return res.status(500).json({
                status: false,
                creator: config.author || "dev.knight",
                message: "لم يتم العثور على رابط صوت مناسب"
            });
        }

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result: {
                title: data.name,
                artist: data.artists.map(a => a.name).join(', '),
                thumbnail: data.coverArt?.sources?.[0]?.url || null,
                duration: video.duration,
                download: audioFormat.url
            }
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            creator: config.author || "dev.knight",
            message: "فشل جلب رابط التحميل",
            error: error.message
        });
    }
});

export default router;