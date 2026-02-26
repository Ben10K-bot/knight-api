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
        const idRes = await axios.post('https://users.roblox.com/v1/usernames/users', {
            usernames: [user],
            excludeBannedUsers: false
        });

        if (!idRes.data.data || idRes.data.data.length === 0) {
            return res.status(404).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "User not found"
  });
        }

        const userId = idRes.data.data[0].id;

        const profileRes = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        
        const avatarRes = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);

        res.json({
      status: true,
      creator: config.author || "dev.knight",
      result: {
                userId: userId,
                username: profileRes.data.name,
                displayName: profileRes.data.displayName,
                description: profileRes.data.description,
                created: profileRes.data.created,
                isBanned: profileRes.data.isBanned,
                externalAppDisplayName: profileRes.data.externalAppDisplayName,
                avatar: avatarRes.data.data[0]?.imageUrl || null
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
