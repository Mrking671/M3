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

// Load movie data (with only id, title, imdbID)
const moviesData = require('./movies.json');
const {
  trendingMovies,
  bollywoodMovies,
  hollywoodMovies,
  southMovies,
  punjabiMovies
} = moviesData;

// Helper function to fetch posters for each movie using OMDB
async function fetchPostersForMovies(movieArray) {
  const updatedArray = [];
  
  for (const movie of movieArray) {
    try {
      const response = await axios.get(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${process.env.OMDB_API_KEY}`);
      const omdbData = response.data;
      
      const validPoster =
        omdbData.Poster && omdbData.Poster !== 'N/A'
          ? omdbData.Poster
          : 'https://via.placeholder.com/300x450.png?text=No+Poster';
      
      updatedArray.push({
        ...movie,
        poster: validPoster
      });
    } catch (error) {
      // If OMDB call fails, use fallback
      updatedArray.push({
        ...movie,
        poster: 'https://via.placeholder.com/300x450.png?text=No+Poster'
      });
    }
  }
  
  return updatedArray;
}

// Homepage: fetch posters for each category, then render
app.get('/', async (req, res) => {
  try {
    const updatedTrending = await fetchPostersForMovies(trendingMovies);
    const updatedBollywood = await fetchPostersForMovies(bollywoodMovies);
    const updatedHollywood = await fetchPostersForMovies(hollywoodMovies);
    const updatedSouth = await fetchPostersForMovies(southMovies);
    const updatedPunjabi = await fetchPostersForMovies(punjabiMovies);

    res.render('index', {
      trendingMovies: updatedTrending,
      bollywoodMovies: updatedBollywood,
      hollywoodMovies: updatedHollywood,
      southMovies: updatedSouth,
      punjabiMovies: updatedPunjabi
    });
  } catch (err) {
    console.error('Error loading posters:', err);
    res.status(500).send('Error loading homepage');
  }
});

// Movie details page
app.get('/movie/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);
  
  // Combine all categories to find the clicked movie
  const allMovies = [
    ...trendingMovies,
    ...bollywoodMovies,
    ...hollywoodMovies,
    ...southMovies,
    ...punjabiMovies
  ];
  
  const movie = allMovies.find((m) => m.id === movieId);
  if (!movie) {
    return res.status(404).send('Movie not found');
  }

  // Fetch full details from OMDB for the details page
  let movieDetails = {};
  try {
    const response = await axios.get(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${process.env.OMDB_API_KEY}`);
    movieDetails = response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    // Fallback to basic info if OMDB fails
    movieDetails = { Title: movie.title, imdbID: movie.imdbID };
  }
  
  // Fallback poster if needed
  const finalPoster =
    movieDetails.Poster && movieDetails.Poster !== 'N/A'
      ? movieDetails.Poster
      : 'https://via.placeholder.com/300x450.png?text=No+Poster';

  res.render('movie', {
    movie: movieDetails,
    fallbackPoster: finalPoster
  });
});

// Download route
app.get('/download/:imdbID', async (req, res) => {
  const imdbID = req.params.imdbID;
  try {
    const results = await telegramBot.searchMovie(imdbID);
    res.render('download', { results, imdbID });
  } catch (error) {
    console.error('Error searching for movie on Telegram:', error);
    res.status(500).send('Error processing download');
  }
});

// Download a specific quality
app.get('/download/:imdbID/:quality', async (req, res) => {
  const { imdbID, quality } = req.params;
  try {
    const downloadLink = await telegramBot.getDownloadLink(imdbID, quality);
    res.redirect(downloadLink);
  } catch (error) {
    console.error('Error getting download link:', error);
    res.status(500).send('Error processing download');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
