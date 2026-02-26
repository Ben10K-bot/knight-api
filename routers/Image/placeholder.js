import express from 'express';
import { createCanvas } from 'canvas';

const router = express.Router();

router.get('/', async (req, res) => {
    const { w, h, text, color } = req.query;
    if (!w || !h || !text || !color) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: w, h, text, or color"
  })
    const width = parseInt(w);
    const height = parseInt(h);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(Math.min(width, height) / 5)}px "Segoe UI"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text ? decodeURIComponent(text) : `${width} x ${height}`, width / 2, height / 2);

    res.set('Content-Type', 'image/png');
    res.send(canvas.toBuffer());
});

export default router;
