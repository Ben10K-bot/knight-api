import express from 'express';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { loadImageFromUrl } from '../../server.js';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { image } = req.query;
  if (!image) {
    return res.status(400).json({ error: 'Missing parameter: image' });
  }

  try {
    const imgBuffer = await loadImageFromUrl(image);
    if (!imgBuffer) {
      return res.status(500).json({
        status: false,
        creator: config.author || "dev.knight",
        message: "Failed to load image"
      });
    }

    const form = new FormData();
    form.append('image', imgBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('format', 'png');
    form.append('model', 'v1');

    const response = await fetch('https://api2.pixelcut.app/image/matte/v1', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'x-locale': 'en',
        'x-client-version': 'web:pixa.com:4a5b0af2',
        'origin': 'https://www.pixa.com',
        'referer': 'https://www.pixa.com/'
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Pixelcut API error: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set('Content-Type', 'image/png');
    res.send(buffer);

  } catch (err) {
    res.status(500).json({
      status: false,
      creator: config.author || "dev.knight",
      error: err.message
    });
  }
});

export default router;