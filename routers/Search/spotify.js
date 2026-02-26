import express from "express";
import axios from "axios";
import { config } from "../../config.js";
import { decrypt } from '../../server.js';

const router = express.Router();

const B_CLIENT_ID = "5b7e4ac962390bb98b800ad5a4d4674a:4b70f72ad14aaf61e4c4d883ba24ab74536f1afa9449fe01d82dcc59023414f1cecbb5f82e0f5aa4a3daded0005bb171";
const B_CLIENT_SECRET = "6fe85814e65f57fbccfb6e9134443b29:cc875813e5ec50c41d7d6cf5b95fac4382f9460647d8df18bcd604886a845ddc00ac5bdcd789d695133584dd820c5c60";

const CLIENT_ID = decrypt(B_CLIENT_ID);
const CLIENT_SECRET = decrypt(B_CLIENT_SECRET);

let tokenCache = null;
let tokenExpire = 0;

async function getSpotifyToken() {
  if (tokenCache && Date.now() < tokenExpire) {
    return tokenCache;
  }

  try {
    const authString = Buffer.from(
      `${CLIENT_ID}:${CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials"
      }),
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    tokenCache = response.data.access_token;
    tokenExpire = Date.now() + response.data.expires_in * 1000;

    return tokenCache;

  } catch (error) {
    console.error("Token Error:", error.message);
    throw new Error("فشل في جلب توكن Spotify");
  }
}

router.get("/", async (req, res) => {
  try {
    const { q, type = "track" } = req.query;

    const allowedTypes = ["track", "artist", "album", "playlist"];

    if (!q || !allowedTypes.includes(type)) {
      return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Invalid query or type"
  });
    }

    const token = await getSpotifyToken();

    const response = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q,
          type,
          limit: 10
        }
      }
    );

const tracks = response.data.tracks.items.map(track => ({
    title: track.name,
    artist: track.artists.map(a => a.name).join(", "),
    album: track.album.name,
    duration_ms: track.duration_ms,
    url: track.external_urls.spotify,
    preview: track.preview_url,
    image: track.album.images[0]?.url
}));

res.json({
    status: true,
    creator: config.author,
    message: "Success",
    total: tracks.length,
    data: tracks
});

  } catch (error) {
    res.status(500).json({
      status: false,
      creator: config.author,
      message: "Search error",
      error: error.response?.data || error.message
    });
  }
});

export default router;