import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const dogRes = await fetch('https://dog.ceo/api/breeds/image/random');
        const dogData = await dogRes.json();
        const imgRes = await fetch(dogData.message);
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
