import express from 'express';
import fetch from 'node-fetch';
import { config } from '../../config.js';

const router = express.Router();

const ALLAH_NAMES_JSON = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/refs/heads/main/Allah-99-names.json';

async function getData() {
    const response = await fetch(ALLAH_NAMES_JSON);
    if (!response.ok) throw new Error(`Failed to fetch 99 names: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid JSON structure: expected an array");
    return data;
}

router.get('/', (req, res) => {
    res.json({
        status: true,
        creator: config.author,
        message: "Welcome to Allah 99 Names API. Available endpoints:",
        endpoints: {
            all: "/all -> returns all names with full details",
            search: "/search?id=... -> search by name or description"
        }
    });
});

router.get('/all', async (req, res) => {
    try {
        const data = await getData();
        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: data });
    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

router.get('/search', async (req, res) => {
    const { q, id } = req.query;

    if (!q && !id) {
        return res.status(400).json({ status: false, creator: config.author, error: "Missing query ?q=... or ?id=..." });
    }

    try {
        const data = await getData();

        let filtered = data;

        if (id) {
            filtered = filtered.filter(n => n.id === parseInt(id));
        }

        if (q) {
            filtered = filtered.filter(n =>
                n.name.includes(q) || n.text.includes(q)
            );
        }

        if (filtered.length === 0) {
            return res.status(404).json({ status: false, creator: config.author, error: "No matching results found" });
        }

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: filtered });

    } catch (err) {
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;
