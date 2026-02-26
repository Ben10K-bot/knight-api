import axios from 'axios';
import express from 'express';
import { config } from '../../config.js';

const router = express.Router();

const CLIENT_ID = "FqfkxJZWPZt411KWUg3pxbwm43M6UalQ"; 

router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                creator: config.author || "dev.knight",
                message: "الرجاء توفير كلمة البحث في الباراميتر q"
            });
        }

        const { data } = await axios.get(
            "https://api-v2.soundcloud.com/search/tracks",
            {
                params: {
                    q,
                    client_id: CLIENT_ID,
                    limit: 10
                }
            }
        );

        const tracks = data.collection.map(track => ({
            title: track.title,
            artist: track.user.username,
            duration: track.duration,
            url: track.permalink_url,
            artwork: track.artwork_url
        }));

        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result: tracks
        });

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "حدث خطأ أثناء البحث",
            error: err.response?.data || err.message
        });
    }
});

export default router;