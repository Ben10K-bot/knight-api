import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, text } = req.query;
    if (!image || !text) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: image or text"
  })

    try {
        const imgBuffer = await loadImageFromUrl(image);
        if (!imgBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const img = await loadImage(imgBuffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = `bold ${Math.floor(img.height / 20)}px "Segoe UI"`;
        ctx.textAlign = 'right';
        ctx.fillText(decodeURIComponent(text), img.width - 20, img.height - 20);

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
