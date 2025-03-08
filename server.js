require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const telegramBot = require('./telegramBot');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Sample trending movies data (in production, replace with an API call)
const trendingMovies = [
  { id: 1, title: "Movie One", poster: "https://via.placeholder.com/300x450", imdbID: "tt1234567" },
  { id: 2, title: "Movie Two", poster: "https://via.placeholder.com/300x450", imdbID: "tt2345678" },
  { id: 3, title: "Movie Three", poster: "https://via.placeholder.com/300x450", imdbID: "tt3456789" }
];

// Homepage: list trending movies
app.get('/', (req, res) => {
  res.render('index', { movies: trendingMovies });
});

// Movie details page: fetch details from OMDB API
app.get('/movie/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);
  const movie = trendingMovies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).send("Movie not found");
  }
  
  let movieDetails = {};
  try {
    const response = await axios.get(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${process.env.OMDB_API_KEY}`);
    movieDetails = response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    movieDetails = movie; // Fallback if API call fails
  }
  
  res.render('movie', { movie: movieDetails });
});

// Download route: trigger Telegram bot search for movie file
app.get('/download/:imdbID', async (req, res) => {
  const imdbID = req.params.imdbID;
  try {
    const results = await telegramBot.searchMovie(imdbID);
    // Render a page to let the user choose quality
    res.render('download', { results, imdbID });
  } catch (error) {
    console.error("Error searching for movie on Telegram:", error);
    res.status(500).send("Error processing download");
  }
});

// Route to start file download for a specific quality
app.get('/download/:imdbID/:quality', async (req, res) => {
  const { imdbID, quality } = req.params;
  try {
    const downloadLink = await telegramBot.getDownloadLink(imdbID, quality);
    // Redirect to the download link (this could trigger a file download)
    res.redirect(downloadLink);
  } catch (error) {
    console.error("Error getting download link:", error);
    res.status(500).send("Error processing download");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
