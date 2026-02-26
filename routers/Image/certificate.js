import express from 'express';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Attempt to register fonts
try {
    registerFont(path.join(__dirname, '../fonts/PlayfairDisplay-Bold.ttf'), { family: 'Playfair' });
    registerFont(path.join(__dirname, '../fonts/Montserrat-Regular.ttf'), { family: 'Montserrat' });
    registerFont(path.join(__dirname, '../fonts/Montserrat-Bold.ttf'), { family: 'Montserrat-Bold' });
} catch (e) {
    console.log('Warning: Could not register custom fonts. Using system defaults.', e.message);
}

router.get('/', async (req, res) => {
    try {
        const { name, course, date } = req.query;
        if (!name || !course) {
            return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing parameters: name, course"
  });
        }

        // 1. Setup Canvas
        const width = 1200;
        const height = 850;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 2. Draw Elegant Background (Creamy Gradient)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#fffcf5');
        gradient.addColorStop(1, '#f4efe4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 3. Draw Geometric Art-Deco Border
        ctx.strokeStyle = '#c5a059'; // Gold
        ctx.lineWidth = 4;
        // Outer border
        ctx.strokeRect(20, 20, width - 40, height - 40);
        
        // Inner delicate border
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 1;
        ctx.strokeRect(35, 35, width - 70, height - 70);

        // Corner Accents
        ctx.fillStyle = '#c5a059';
        const cornerSize = 20;
        // Top Left
        ctx.fillRect(20, 20, cornerSize, 4);
        ctx.fillRect(20, 20, 4, cornerSize);
        // Top Right
        ctx.fillRect(width - 20 - cornerSize, 20, cornerSize, 4);
        ctx.fillRect(width - 24, 20, 4, cornerSize);
        // Bottom Left
        ctx.fillRect(20, height - 24, cornerSize, 4);
        ctx.fillRect(20, height - 20 - cornerSize, 4, cornerSize);
        // Bottom Right
        ctx.fillRect(width - 20 - cornerSize, height - 24, cornerSize, 4);
        ctx.fillRect(width - 24, height - 20 - cornerSize, 4, cornerSize);

        // 4. Watermark Logo (Subtle)
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 400px "Playfair", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', width / 2, height / 2 + 50);
        ctx.restore();

        // 5. Header
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 20px "Montserrat", sans-serif';
        ctx.letterSpacing = '10px'; // Note: canvas support for letterSpacing varies, mostly visual logic handled by manual spacing if needed, but let's rely on standard font.
        
        // Draw "CERTIFICATE" with manual spacing simulation if needed, or just standard text
        ctx.fillText('CERTIFICATE', width / 2, 100);
        
        ctx.font = 'bold 50px "Playfair", serif';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText('Certificate of Completion', width / 2, 160);

        // Decorative line under title
        ctx.beginPath();
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 2;
        ctx.moveTo(400, 190);
        ctx.lineTo(800, 190);
        ctx.stroke();

        // 6. Body Text
        ctx.fillStyle = '#555555';
        ctx.font = '22px "Montserrat", sans-serif';
        ctx.fillText('This document certifies that', width / 2, 280);

        // Recipient Name
        ctx.fillStyle = '#111111';
        ctx.font = 'italic bold 50px "Segoe UI", serif';
        const decodedName = decodeURIComponent(name);
        ctx.fillText(decodedName, width / 2, 360);

        // Name Underline
        const nameWidth = ctx.measureText(decodedName).width;
        ctx.beginPath();
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 2;
        ctx.moveTo((width / 2) - (nameWidth / 2) - 10, 375);
        ctx.lineTo((width / 2) + (nameWidth / 2) + 10, 375);
        ctx.stroke();

        ctx.fillStyle = '#555555';
        ctx.font = '22px "Montserrat", sans-serif';
        ctx.fillText('has successfully completed the course', width / 2, 430);

        // Course Name
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 32px "Segoe UI", sans-serif';
        const decodedCourse = decodeURIComponent(course);
        ctx.fillText(decodedCourse, width / 2, 490);

        // Date
        if (date) {
            ctx.fillStyle = '#888888';
            ctx.font = '18px "Montserrat", sans-serif';
            ctx.fillText(`Date: ${decodeURIComponent(date)}`, width / 2, 550);
        }

        // 7. Signatures and Seal
        // Signature Lines
        const signatureY = 680;
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;

        // Circular Seal
        drawOfficialSeal(ctx, width / 2, signatureY - 40, 80);

        // 8. Send Response
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        const buffer = canvas.toBuffer('image/png');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: 'Error generating certificate',
            error: error.message 
        });
    }
});

// Helper function to draw a professional seal
function drawOfficialSeal(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);

    // Outer Circle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = '#c5a059';
    ctx.fill();

    // Inner Circle
    ctx.beginPath();
    ctx.arc(0, 0, size - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fffcf5';
    ctx.fill();

    // Text on Circle Path (Simplified as straight text for node-canvas simplicity)
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 12px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL', 0, -10);
    ctx.fillText('CERTIFICATION', 0, 8);

    // Star Icon
    ctx.font = '30px serif';
    ctx.fillText('✓', 0, -30); // Checkmark or Star

    ctx.restore();
}

export default router;
