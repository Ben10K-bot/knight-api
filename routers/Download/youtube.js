import express from 'express';
import ytdl from '@distube/ytdl-core';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const url = req.query.url;

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "رابط يوتيوب غير صالح"
  });
    }

    try {
        const info = await ytdl.getInfo(url);

        const videosMap = {};
        ytdl.filterFormats(info.formats, 'videoonly')
            .filter(f => f.container === 'mp4')
            .forEach(f => {
                const q = f.qualityLabel;
                if (!videosMap[q] || (f.contentLength && Number(f.contentLength) > Number(videosMap[q].size))) {
                    videosMap[q] = {
                        quality: f.qualityLabel,
                        fps: f.fps,
                        size: f.contentLength || null,
                        url: f.url
                    };
                }
            });
        const videos = Object.values(videosMap).sort((a, b) => parseInt(a.quality) - parseInt(b.quality));

        const audiosMap = {};
        ytdl.filterFormats(info.formats, 'audioonly')
            .forEach(f => {
                const br = f.audioBitrate;
                if (!audiosMap[br] || (f.contentLength && Number(f.contentLength) > Number(audiosMap[br].size))) {
                    audiosMap[br] = {
                        bitrate: f.audioBitrate,
                        container: f.container,
                        size: f.contentLength || null,
                        url: f.url
                    };
                }
            });
        const audios = Object.values(audiosMap).sort((a, b) => b.bitrate - a.bitrate);

        const combinedMap = {};
        ytdl.filterFormats(info.formats, 'videoandaudio')
            .filter(f => f.container === 'mp4')
            .forEach(f => {
                const q = f.qualityLabel;
                if (!combinedMap[q] || (f.contentLength && Number(f.contentLength) > Number(combinedMap[q].size))) {
                    combinedMap[q] = {
                        quality: f.qualityLabel,
                        fps: f.fps,
                        size: f.contentLength || null,
                        url: f.url
                    };
                }
            });
        const combined = Object.values(combinedMap).sort((a, b) => parseInt(a.quality) - parseInt(b.quality));

        const result = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails?.pop()?.url,
            duration: info.videoDetails.lengthSeconds,
            uploader: info.videoDetails.author.name,
            views: info.videoDetails.viewCount,
            videos,
            audios,
            combined
        };

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result
        });

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "فشل استخراج البيانات",
            error: err.message
        });
    }
});

export default router;
