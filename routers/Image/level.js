import express from 'express';
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 520;

const FONT_FAMILY = 'Segoe UI'; 

const router = express.Router();

/**
 * دالة لرسم مستطيل بحواف مستديرة.
 * @param {CanvasRenderingContext2D} ctx - سياق الرسم.
 * @param {number} x - إحداثي X.
 * @param {number} y - إحداثي Y.
 * @param {number} width - العرض.
 * @param {number} height - الارتفاع.
 * @param {number} radius - نصف قطر الانحناء.
 */
function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

/**
 * تحميل صورة من رابط URL وتحويلها إلى Buffer.
 * @param {string} url - رابط الصورة.
 * @returns {Promise<Buffer|null>}
 */
async function loadImageFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error(`❌ Error loading image from ${url}:`, error.message);
        return null;
    }
}

router.get('/', async (req, res) => {
    const {background, icon, level, xpFrom, xpTo, name, bot} = req.query;

    try {
        let {
            background,
            icon,
            level = 1,
            xpFrom = 0,
            xpTo = 1000,
            name = 'User',
            bot = 'Bot Name',
            watermark = 'dev.knight'
        } = req.query;

        name = decodeURIComponent(name);
        bot = decodeURIComponent(bot);
        watermark = 'By: ' + decodeURIComponent(watermark);

        if (!background || !icon) {
            return res.status(400).json({
    status: false,
    creator: config.author || "dev.knight",
    message: "Missing required parameters: background, icon, level, xpFrom, xpTo, name, bot"
  });
        }

        const backgroundBuffer = await loadImageFromUrl(background);
        const iconBuffer = await loadImageFromUrl(icon);

        if (!backgroundBuffer || !iconBuffer) {
            return res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
        }

        const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const ctx = canvas.getContext('2d');

        const bgImg = await loadImage(backgroundBuffer);
        const iconImg = await loadImage(iconBuffer);

        ctx.save();
        roundRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 30);
        ctx.clip();
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();

        const boxW = 700, boxH = 160;
        const boxX = (CANVAS_WIDTH - boxW) / 2, boxY = 110;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        roundRect(ctx, boxX, boxY, boxW, boxH, 35);
        ctx.fill();
        ctx.restore();

        const radius = 65;
        const iconX = boxX + 90, iconY = boxY + boxH / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(iconX, iconY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(iconImg, iconX - radius, iconY - radius, radius * 2, radius * 2);
        ctx.restore();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(iconX, iconY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textStartX = iconX + radius + 25;

        const drawDynamicText = (label, value, y, valueColor) => {
            ctx.font = `bold 28px "${FONT_FAMILY}"`;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(label, textStartX, y);
            
            const labelWidth = ctx.measureText(label).width;
            const valueX = textStartX + labelWidth + 15;
        
            ctx.fillStyle = valueColor;
            ctx.fillText(value, valueX, y);
        };

        drawDynamicText('User:', name, boxY + 55, '#00BFFF');
        drawDynamicText('Bot:', bot, boxY + 105, '#00BFFF');

        ctx.fillStyle = '#FFEB3B';
        ctx.font = `bold 24px "${FONT_FAMILY}"`;
        ctx.textAlign = 'right';
        ctx.fillText(`Level: ${level}`, boxX + boxW - 40, boxY + 45);

        const barBoxW = 700, barBoxH = 80;
        const barBoxX = (CANVAS_WIDTH - barBoxW) / 2, barBoxY = 320;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        roundRect(ctx, barBoxX, barBoxY, barBoxW, barBoxH, 40);
        ctx.fill();
        ctx.restore();

        const barW = barBoxW - 160, barH = 35;
        const barX = barBoxX + 80, barY = barBoxY + (barBoxH - barH) / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, barX, barY, barW, barH, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        roundRect(ctx, barX, barY, barW, barH, 18);
        ctx.stroke();

        const progress = Math.min(xpFrom / xpTo, 1);
        if (progress > 0) {
            const progressWidth = barW * progress;
            const gradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
            gradient.addColorStop(0, '#00F260');
            gradient.addColorStop(1, '#0575E6'); 
            ctx.fillStyle = gradient;
            roundRect(ctx, barX, barY, progressWidth, barH, 18);
            ctx.fill();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 24px "${FONT_FAMILY}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(`${xpFrom} / ${xpTo} XP`, barX + barW / 2, barY + barH / 2);
        ctx.shadowColor = 'transparent';

        const drawLevelCircle = (x, y, num, color) => {
            const circleRadius = 30;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 28px "${FONT_FAMILY}"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(num, x, y);
        };

        drawLevelCircle(barBoxX + 45, barBoxY + barBoxH / 2, level, '#ff4444'); 
        drawLevelCircle(barBoxX + barBoxW - 45, barBoxY + barBoxH / 2, parseInt(level) + 1, '#44ff44');

        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `italic 20px "${FONT_FAMILY}"`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermark, CANVAS_WIDTH - 25, CANVAS_HEIGHT - 20);
        ctx.restore();

        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error('❌ An unexpected error occurred:', error);
        res.status(500).json({
    status: false,
    creator: config.author || "dev.knight",
    message: err.message
  });
    }
});

export default router;
