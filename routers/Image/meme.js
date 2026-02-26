import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, top, bottom } = req.query;
    if (!image || (!top && !bottom)) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameters: image, top, bottom"
  });
    }

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

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.floor(img.height / 10)}px "Segoe UI"`;

        if (top) {
            ctx.fillText(decodeURIComponent(top).toUpperCase(), img.width / 2, img.height / 8);
            ctx.strokeText(decodeURIComponent(top).toUpperCase(), img.width / 2, img.height / 8);
        }

        if (bottom) {
            ctx.fillText(decodeURIComponent(bottom).toUpperCase(), img.width / 2, img.height * 0.9);
            ctx.strokeText(decodeURIComponent(bottom).toUpperCase(), img.width / 2, img.height * 0.9);
        }

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
