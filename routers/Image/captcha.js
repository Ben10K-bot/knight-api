import express from 'express';
import { createCanvas } from 'canvas';

const router = express.Router();

router.get('/', async (req, res) => {
    const text = Math.random().toString(36).substring(2, 8).toUpperCase();
    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 100);

    for (let i = 0; i < 10; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 100);
        ctx.lineTo(Math.random() * 200, Math.random() * 100);
        ctx.stroke();
    }

    ctx.font = 'bold 40px "Segoe UI"';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 100, 50);

    res.set('Content-Type', 'image/png');
    res.send(canvas.toBuffer());
});

export default router;
