import express from 'express';
import sharp from 'sharp';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, width, color } = req.query;
    if (!image || !width || !color) return res.status(400).json({ error: 'Missing parameter: image, width, or color' });

    try {
        const imgBuffer = await loadImageFromUrl(image);
        if (!imgBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const buffer = await sharp(imgBuffer)
            .extend({
                top: parseInt(width),
                bottom: parseInt(width),
                left: parseInt(width),
                right: parseInt(width),
                background: color
            }).toBuffer();
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
