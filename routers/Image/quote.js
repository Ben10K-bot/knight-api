import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl, roundRect } from '../../server.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const { background, icon, name, text } = req.query;
    if (!background || !icon || !name || !text) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameters: background, icon, name, text"
  });
    }

    try {
        const bgBuffer = await loadImageFromUrl(background);
        const iconBuffer = await loadImageFromUrl(icon);
        if (!bgBuffer || !iconBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const canvas = createCanvas(1200, 630);
        const ctx = canvas.getContext('2d');

        const bgImg = await loadImage(bgBuffer);
        ctx.drawImage(bgImg, 0, 0, 1200, 630);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        roundRect(ctx, 100, 100, 1000, 430, 40);
        ctx.fill();

        const iconImg = await loadImage(iconBuffer);
        ctx.save();
        ctx.beginPath();
        ctx.arc(200, 200, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(iconImg, 140, 140, 120, 120);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.textAlign = 'left';
        ctx.fillText(decodeURIComponent(name), 280, 210);

        ctx.font = 'italic 48px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(`"${decodeURIComponent(text)}"`, 600, 400);

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
