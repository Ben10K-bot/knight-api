import express from 'express';
import sharp from 'sharp';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, level} = req.query;
    if (!image || !level) return res.status(400).json({ error: 'Missing parameter: image or level' });

    try {
        const imgBuffer = await loadImageFromUrl(image);
        if (!imgBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const buffer = await sharp(imgBuffer).modulate({ brightness: parseFloat(level) }).toBuffer();
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
