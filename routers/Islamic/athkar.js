import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        const response = await fetch('https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json');
        if (!response.ok) throw new Error(`Failed to fetch azkar: ${response.status}`);
        const data = await response.json();

        if (category) {
            const catKey = Object.keys(data).find(key => key === category);
            if (!catKey) {
                return res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Category not found"
  });
            }
            return res.json({
                status: true,
                creator: config.author,
                category: catKey,
                azkar: data[catKey]
            });
        }

        res.json({
            status: true,
            creator: config.author,
            azkar: data
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
