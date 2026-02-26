import express from 'express';
import sharp from 'sharp';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image } = req.query;
    if (!image) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: image"
  })

    try {
        const imgBuffer = await loadImageFromUrl(image);
        if (!imgBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const buffer = await sharp(imgBuffer).recomb([
            [0.393, 0.769, 0.189],
            [0.349, 0.686, 0.168],
            [0.272, 0.534, 0.131]
        ]).toBuffer();
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: e.message
  });
    }
});

export default router;
