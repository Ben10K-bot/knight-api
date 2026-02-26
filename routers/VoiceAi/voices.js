import express from 'express';
import { listVoices } from 'edge-tts-universal';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const voices = await listVoices();
        res.json({
            status: true,
            creator: config.author,
            voices: voices
        });
    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;