// // // // src/movies.js
// import React, { useEffect, useState } from "react";
// import { MovieCard } from "./MovieCard";
// import IconButton from "@mui/material/IconButton";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import { useNavigate } from "react-router-dom";
// import apiService from "./services/api.service";
// import { Box, Container, Typography, Grid, CircularProgress } from "@mui/material";

// function Movie() {
//   const [moviesData, setMoviesData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     getMovies();
//   }, []);

//   const getMovies = async () => {
//     try {
//       setLoading(true);
//       const movies = await apiService.getMovies();
//       setMoviesData(movies);
//       setError(null);
//     } catch (error) {
//       console.error("Error fetching movies:", error);
//       setError("Failed to load movies. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteMovie = async (id) => {
//     try {
//       await apiService.deleteMovie(id);
//       // Refresh the movie list after deletion
//       getMovies();
//     } catch (error) {
//       console.error("Error deleting movie:", error);
//       setError("Failed to delete movie. Please try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl">
//       <Typography variant="h4" sx={{ my: 3 }}>
//         All Movies
//       </Typography>
      
//       {moviesData.length === 0 ? (
//         <Typography>No movies found. Add some movies to get started!</Typography>
//       ) : (
//         <Grid container spacing={3}>
//           {moviesData.map((movie) => (
//             <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
//               <MovieCard
//                 id={movie._id}
//                 name={movie.name}
//                 desc={movie.desc}
//                 director={movie.director}
//                 yearOfRelease={movie.yearOfRelease}
//                 poster={movie.poster}
//                 producer={movie.producer || { name: "Unknown" }}
//                 actors={movie.actors || []}
//                 deleteButton={
//                   <IconButton
//                     onClick={() => deleteMovie(movie._id)}
//                     color="error"
//                     aria-label="delete"
//                     size="large"
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 }
//                 editButton={
//                   <IconButton
//                     onClick={() => navigate(`/movies/edit/${movie._id}`)}
//                     color="primary"
//                     aria-label="edit"
//                     size="large"
//                   >
//                     <EditIcon />
//                   </IconButton>
//                 }
//               />
//             </Grid>
//           ))}
//         </Grid>
//       )}
//     </Container>
//   );
// }

// export default Movie;
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "./services/api.service";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

function Movie() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMovies();
      
      // Handle both success and error responses
      if (response.error) {
        setError(response.error);
        setMovies([]);
      } else if (response.movies) {
        setMovies(response.movies);
      } else {
        // Handle legacy response format
        setMovies(response);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError(error.message || "Failed to fetch movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleEditClick = (movieId) => {
    navigate(`/movies/edit/${movieId}`);
  };

  const handleDeleteClick = (movie) => {
    setSelectedMovie(movie);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMovie) return;
    
    try {
      await apiService.deleteMovie(selectedMovie._id);
      setDeleteDialogOpen(false);
      fetchMovies(); // Refresh the movie list
    } catch (error) {
      console.error("Error deleting movie:", error);
      setError(error.message || "Failed to delete movie");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedMovie(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchMovies}>
          Retry
        </Button>
      </Box>
    );
  }

  if (movies.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">No movies found. Add some movies to get started!</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/add-movies')}
        >
          Add Movies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        All Movies
      </Typography>
      
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                height="250"
                image={movie.posterUrl || "https://via.placeholder.com/250x350?text=No+Poster"}
                alt={movie.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {movie.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Year: {movie.year}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Producer: {movie.producer?.name || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Actors:{" "}
                  {movie.actors && movie.actors.length > 0
                    ? movie.actors.map((actor) => actor.name).join(", ")
                    : "None"}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(movie._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(movie)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedMovie?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Movie;
