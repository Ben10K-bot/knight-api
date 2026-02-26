import express from 'express';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query parameter ?q=package-name"
  });
    }
    try {
        const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=10`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await response.json();
        res.json({
            status: true,
            creator: config.author,
            data: data.objects
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            creator: config.author,
            message: "Error fetching npm packages",
            error: error.message
        });
    }
});

export default router;