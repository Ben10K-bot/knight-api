import express from 'express';
import { createCanvas, loadImage } from 'canvas';
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

        const img = await loadImage(imgBuffer);
        const size = Math.min(img.width, img.height);
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);

        res.set('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (e) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: e.message
  });
    }
});

export default router;
