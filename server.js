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

// Sample data for movies
const trendingMovies = [
  { id: 1, title: "Trending One", poster: "https://via.placeholder.com/300x450", imdbID: "tt1234567" },
  { id: 2, title: "Trending Two", poster: "https://via.placeholder.com/300x450", imdbID: "tt2345678" },
  { id: 3, title: "Trending Three", poster: "https://via.placeholder.com/300x450", imdbID: "tt3456789" }
];

const bollywoodMovies = [
  { id: 101, title: "Bollywood Movie 1", poster: "https://via.placeholder.com/300x450", imdbID: "tt1010101" },
  { id: 102, title: "Bollywood Movie 2", poster: "https://via.placeholder.com/300x450", imdbID: "tt1010102" },
  { id: 103, title: "Bollywood Movie 3", poster: "https://via.placeholder.com/300x450", imdbID: "tt1010103" }
];

const hollywoodMovies = [
  { id: 201, title: "Hollywood Movie 1", poster: "https://via.placeholder.com/300x450", imdbID: "tt2020201" },
  { id: 202, title: "Hollywood Movie 2", poster: "https://via.placeholder.com/300x450", imdbID: "tt2020202" },
  { id: 203, title: "Hollywood Movie 3", poster: "https://via.placeholder.com/300x450", imdbID: "tt2020203" }
];

const southMovies = [
  { id: 301, title: "South Movie 1", poster: "https://via.placeholder.com/300x450", imdbID: "tt3030301" },
  { id: 302, title: "South Movie 2", poster: "https://via.placeholder.com/300x450", imdbID: "tt3030302" },
  { id: 303, title: "South Movie 3", poster: "https://via.placeholder.com/300x450", imdbID: "tt3030303" }
];

const punjabiMovies = [
  { id: 401, title: "Punjabi Movie 1", poster: "https://via.placeholder.com/300x450", imdbID: "tt4040401" },
  { id: 402, title: "Punjabi Movie 2", poster: "https://via.placeholder.com/300x450", imdbID: "tt4040402" },
  { id: 403, title: "Punjabi Movie 3", poster: "https://via.placeholder.com/300x450", imdbID: "tt4040403" }
];

// Homepage: render search bar and movie sections
app.get('/', (req, res) => {
  res.render('index', { 
    trendingMovies, 
    bollywoodMovies, 
    hollywoodMovies, 
    southMovies, 
    punjabiMovies 
  });
});

// Movie details page: fetch details from OMDB API
app.get('/movie/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);
  // Combine all movie arrays to find the movie
  const allMovies = [...trendingMovies, ...bollywoodMovies, ...hollywoodMovies, ...southMovies, ...punjabiMovies];
  const movie = allMovies.find(m => m.id === movieId);
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
