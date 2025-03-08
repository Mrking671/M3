require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const pollingEnabled = process.env.TELEGRAM_POLLING_ENABLED === 'true';

let bot;
if (token) {
  if (pollingEnabled) {
    bot = new TelegramBot(token, { polling: true });
    console.log('Telegram bot polling is enabled.');
  } else {
    bot = new TelegramBot(token, { polling: false });
    console.log('Telegram bot polling is disabled. Use webhook mode or ensure only one instance runs.');
  }
} else {
  console.log('No TELEGRAM_BOT_TOKEN provided. Telegram features will not work properly.');
}

// Simulated function to search for a movie file in your Telegram channels by imdbID
async function searchMovie(imdbID) {
  // In production, replace with real search logic
  return [
    { quality: '720p', link: `https://example.com/download/${imdbID}/720p` },
    { quality: '1080p', link: `https://example.com/download/${imdbID}/1080p` },
    { quality: '4K', link: `https://example.com/download/${imdbID}/4k` }
  ];
}

// Simulated function to retrieve a download link for the selected quality
async function getDownloadLink(imdbID, quality) {
  // In production, replace with real logic
  return `https://example.com/files/${imdbID}-${quality}.mp4`;
}

module.exports = {
  searchMovie,
  getDownloadLink
};
