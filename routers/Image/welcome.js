import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import { loadImageFromUrl, roundRect } from '../../server.js';


const router = express.Router();

router.get('/', async (req, res) => {
    const { background, icon, name, group } = req.query;
    if (!background || !icon || !name || !group) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameters: background, icon, name, group"
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

        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        const bgImg = await loadImage(bgBuffer);
        ctx.drawImage(bgImg, 0, 0, 800, 400);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, 50, 50, 700, 300, 20);
        ctx.fill();

        const iconImg = await loadImage(iconBuffer);
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 150, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(iconImg, 320, 70, 160, 160);
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(`Welcome ${decodeURIComponent(name)}`, 400, 280);
        
        ctx.font = '24px "Segoe UI"';
        ctx.fillText(`To The ${decodeURIComponent(group)} Group`, 400, 320);

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
