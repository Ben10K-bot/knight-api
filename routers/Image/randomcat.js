import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const catRes = await fetch('https://api.thecatapi.com/v1/images/search');
        const catData = await catRes.json();
        const imgRes = await fetch(catData[0].url);
        const buffer = await imgRes.arrayBuffer();
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(buffer));
    } catch (e) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: e.message
  });
    }
});

export default router;
