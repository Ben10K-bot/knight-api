import express from 'express';
import axios from 'axios';
import { config } from '../../config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { book, author} = req.query;

  if (!book && !author) {
    return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing query parameter ?book=bookname or ?author=authorname"
  });
  }

  try {
    const queryParam = book ? `q=${encodeURIComponent(book)}` : `author=${encodeURIComponent(author)}`;
    const url = `https://openlibrary.org/search.json?${queryParam}&page=${page}&limit=${limit}`;

    const response = await axios.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });

    const simplifiedBooks = response.data.docs.map(doc => ({
      title: doc.title,
      author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
      year: doc.first_publish_year || 'Unknown',
      cover: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null,
      openlibrary_url: `https://openlibrary.org${doc.key}`
    }));

    res.json({
      status: true,
      creator: config.author,
      total_results: response.data.numFound,
      books: simplifiedBooks
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