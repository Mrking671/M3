require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Error: TELEGRAM_BOT_TOKEN is not provided. Check your environment variables.");
  process.exit(1);
}

// Use an environment variable to control polling.
// Set TELEGRAM_POLLING_ENABLED to "true" for development, but "false" in production if another polling instance exists.
const pollingEnabled = process.env.TELEGRAM_POLLING_ENABLED === 'true';

let bot;
if (pollingEnabled) {
  bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot polling is enabled.");
} else {
  // If polling is disabled, you may set up webhook mode or simply disable updates.
  bot = new TelegramBot(token, { polling: false });
  console.log("Telegram bot polling is disabled. Use webhook mode or ensure only one polling instance runs.");
}

// Simulated function to search for a movie file in your Telegram channels by imdbID.
async function searchMovie(imdbID) {
  // Replace this dummy data with actual logic to search your Telegram channels.
  return [
    { quality: "720p", link: `https://example.com/download/${imdbID}/720p` },
    { quality: "1080p", link: `https://example.com/download/${imdbID}/1080p` },
    { quality: "4K", link: `https://example.com/download/${imdbID}/4k` }
  ];
}

// Simulated function to retrieve a download link for the selected quality.
async function getDownloadLink(imdbID, quality) {
  // Replace with your actual logic to retrieve the file URL from Telegram.
  return `https://example.com/files/${imdbID}-${quality}.mp4`;
}

module.exports = {
  searchMovie,
  getDownloadLink
};
