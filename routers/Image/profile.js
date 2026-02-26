import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl, roundRect } from '../../server.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const { background, icon, name, bio, status } = req.query;
    if (!background || !icon || !name || !status || !bio) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameters: background, icon, name, status, bio"
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

        const canvas = createCanvas(600, 800);
        const ctx = canvas.getContext('2d');

        const bgImg = await loadImage(bgBuffer);
        ctx.drawImage(bgImg, 0, 0, 600, 800);

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        roundRect(ctx, 30, 30, 540, 740, 30);
        ctx.fill();

        const iconImg = await loadImage(iconBuffer);
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 200, 100, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(iconImg, 200, 100, 200, 200);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(decodeURIComponent(name), 300, 360);

        ctx.font = '24px "Segoe UI"';
        ctx.fillText(decodeURIComponent(status || 'Online'), 300, 400);

        ctx.font = '20px "Segoe UI"';
        ctx.fillText(decodeURIComponent(bio || 'No bio available'), 300, 450);

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
