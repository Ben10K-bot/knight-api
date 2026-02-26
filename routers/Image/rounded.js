import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, radius} = req.query;
    if (!image || !radius) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: image or radius"
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
        const r = parseInt(radius);

        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(img.width - r, 0);
        ctx.quadraticCurveTo(img.width, 0, img.width, r);
        ctx.lineTo(img.width, img.height - r);
        ctx.quadraticCurveTo(img.width, img.height, img.width - r, img.height);
        ctx.lineTo(r, img.height);
        ctx.quadraticCurveTo(0, img.height, 0, img.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);

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
