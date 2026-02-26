import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { user } = req.query;

    if (!user) {
        return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?user=username"
  });
    }

    try {
        const url = `https://registry.npmjs.org/-/v1/search?text=author:${encodeURIComponent(user)}&size=20`;

        const response = await axios.get(url, {
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const packages = response.data.objects.map(pkg => ({
            name: pkg.package.name,
            version: pkg.package.version,
            description: pkg.package.description,
            links: pkg.package.links,
            date: pkg.package.date
        }));

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: {
                author: user,
                total_packages: response.data.total,
                packages: packages
            }
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
