import express from 'express';
import sharp from 'sharp';
import { config } from 'config';
import { loadImageFromUrl } from '../../server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { image, w, h} = req.query;
    if (!image || !w || !h) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: image, w, or h"
  })

    try {
        const imgBuffer = await loadImageFromUrl(image);
        if (!imgBuffer) return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });

        const buffer = await sharp(imgBuffer).resize(parseInt(w), parseInt(h)).toBuffer();
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: e.message
  });
    }
});

export default router;
