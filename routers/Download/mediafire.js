import express from 'express';
import { config } from '../../config.js';
import getMediaFireLink from 'mediafire-getlink';

const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "الرجاء توفير رابط MediaFire في الباراميتر url"
  });
    }

    try {
        const directDownloadUrl = await getMediaFireLink(url);
        res.json({
            status: true,
            creator: config.author || "dev.knight",
            result: {
                url: directDownloadUrl
            }
        });
    } catch (error) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "فشل الاتصال بسيرفر التحميل",
            error: error.message
        });
    }
}); 

export default router;