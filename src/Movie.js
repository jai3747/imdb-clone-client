// // // src/movies.js
import React, { useEffect, useState } from "react";
import { MovieCard } from "./MovieCard";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import apiService from "./services/api.service";
import { Box, Container, Typography, Grid, CircularProgress } from "@mui/material";

function Movie() {
  const [moviesData, setMoviesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMovies();
  }, []);

  const getMovies = async () => {
    try {
      setLoading(true);
      const movies = await apiService.getMovies();
      setMoviesData(movies);
      setError(null);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    try {
      await apiService.deleteMovie(id);
      // Refresh the movie list after deletion
      getMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      setError("Failed to delete movie. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ my: 3 }}>
        All Movies
      </Typography>
      
      {moviesData.length === 0 ? (
        <Typography>No movies found. Add some movies to get started!</Typography>
      ) : (
        <Grid container spacing={3}>
          {moviesData.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
              <MovieCard
                id={movie._id}
                name={movie.name}
                desc={movie.desc}
                director={movie.director}
                yearOfRelease={movie.yearOfRelease}
                poster={movie.poster}
                producer={movie.producer || { name: "Unknown" }}
                actors={movie.actors || []}
                deleteButton={
                  <IconButton
                    onClick={() => deleteMovie(movie._id)}
                    color="error"
                    aria-label="delete"
                    size="large"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                editButton={
                  <IconButton
                    onClick={() => navigate(`/movies/edit/${movie._id}`)}
                    color="primary"
                    aria-label="edit"
                    size="large"
                  >
                    <EditIcon />
                  </IconButton>
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Movie;