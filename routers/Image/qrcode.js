import express from 'express';
import QRCode from 'qrcode';

const router = express.Router();

router.get('/', async (req, res) => {
    const { text, size = 300 } = req.query;
    if (!text) return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameter: text"
  })

    try {
        const buffer = await QRCode.toBuffer(decodeURIComponent(text), { width: parseInt(size) });
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
