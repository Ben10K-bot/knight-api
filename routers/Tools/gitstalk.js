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
        const url = `https://api.github.com/users/${encodeURIComponent(user)}`;
        const reposUrl = `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=5&sort=updated`;

        const [userRes, reposRes] = await Promise.all([
            axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
            axios.get(reposUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        ]);

        const userData = userRes.data;
        const reposData = reposRes.data.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language
        }));

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: {
                profile: {
                    username: userData.login,
                    name: userData.name,
                    bio: userData.bio,
                    avatar: userData.avatar_url,
                    url: userData.html_url,
                    location: userData.location,
                    blog: userData.blog,
                    public_repos: userData.public_repos,
                    public_gists: userData.public_gists,
                    followers: userData.followers,
                    following: userData.following,
                    created_at: userData.created_at
                },
                recent_repos: reposData
            }
        });

    } catch (err) {
        res.status(err.response?.status || 500).json({
            status: false,
            creator: config.author,
            error: err.message
        });
    }
});

export default router;
