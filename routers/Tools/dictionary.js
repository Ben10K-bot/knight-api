import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query ?word=hello"
  });
  }

  try {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await axios.get(url);

    const simplified = response.data.map(entry => {
      let audio = null;
      if (entry.phonetics && entry.phonetics.length) {
        const phonWithAudio = entry.phonetics.find(p => p.audio);
        if (phonWithAudio) audio = phonWithAudio.audio;
      }

      return {
        word: entry.word,
        phonetic: entry.phonetic || null,
        audio,
        meanings: entry.meanings.map(m => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.map(d => d.definition)
        })),
        sourceUrls: entry.sourceUrls || []
      };
    });

    res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: simplified
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