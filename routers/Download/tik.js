import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';
import he from 'he';

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
        const apiUrl = "https://lovetik.com/api/ajax/search";
        const params = new URLSearchParams();
        params.append('query', videoUrl);

        const ass = axios.post;

        const response = await ass(apiUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://lovetik.com/'
            }
        });

        const data = response.data;

        if (data && data.status === 'ok' && data.p === 'convert') {
            
            const processLinks = (links) => {
                return links.map(link => ({
                    quality: he.decode(link.t).replace(/<\/?[^>]+(>|$)/g, "").trim(),
                    size: link.s || "N/A",
                    url: link.a
                }));
            };

            const allLinks = processLinks(data.links || []);

            res.json({
                status: true,
                creator: config.author || "dev.knight",
                result: {
                    metadata: {
                        title: he.decode(data.desc || "").replace(/<\/?[^>]+(>|$)/g, "").trim(),
                        thumbnail: data.cover,
                    },
                    author: {
                        username: data.author,
                        nickname: data.author_name || "",
                        avatar: data.author_a || ""
                    },
                    download: {
                        nowm: data.links.find(l => l.ft === 1)?.a || data.links[0]?.a,
                        watermark: data.links.find(l => l.ft === 2)?.a || "", 
                        audio: data.links.find(l => l.t.includes('MP3'))?.a || "", 
                    },
                    all_formats: allLinks
                }
            });
        } else {
            res.status(404).json({
                status: false,
                creator: config.author || "dev.knight",
                message: data.mess || "تعذر العثور على بيانات الفيديو، تأكد من الرابط."
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