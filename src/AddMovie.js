//addmovies.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Typography,
  Alert
} from "@mui/material";
import apiService from './services/api.service';

const validationSchema = yup.object({
  name: yup.string().required("Name field is mandatory").min(3),
  desc: yup.string().required("Description is mandatory").min(1),
  director: yup.string().required("Director field is mandatory").min(5),
  poster: yup.string().required("Poster is mandatory").min(5),
  yearOfRelease: yup
    .number()
    .required("Year of release field is mandatory")
    .min(1900)
    .max(new Date().getFullYear()),
});

function AddMovie() {
  const navigate = useNavigate();
  const [actors, setActors] = useState([]);
  const [producer, setProducer] = useState('');
  const [producerList, setProducerList] = useState([]);
  const [actorList, setActorList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [producerData, actorData] = await Promise.all([
          apiService.get('/producers'),
          apiService.get('/actors')
        ]);
        setProducerList(producerData);
        setActorList(actorData);
      } catch (err) {
        setError("Failed to fetch required data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      desc: "",
      director: "",
      poster: "",
      yearOfRelease: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!producer) {
        setError("Please select a producer");
        return;
      }
      if (actors.length === 0) {
        setError("Please select at least one actor");
        return;
      }

      try {
        setLoading(true);
        await apiService.addMovie({
          ...values,
          actors,
          producer
        });
        navigate("/");
      } catch (err) {
        setError(err.message || "Failed to add movie");
        console.error("Submit error:", err);
      } finally {
        setLoading(false);
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Add Movie
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Movie Name"
            {...formik.getFieldProps('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            {...formik.getFieldProps('desc')}
            error={formik.touched.desc && Boolean(formik.errors.desc)}
            helperText={formik.touched.desc && formik.errors.desc}
          />

          <TextField
            fullWidth
            label="Director"
            {...formik.getFieldProps('director')}
            error={formik.touched.director && Boolean(formik.errors.director)}
            helperText={formik.touched.director && formik.errors.director}
          />

          <TextField
            fullWidth
            label="Poster URL"
            {...formik.getFieldProps('poster')}
            error={formik.touched.poster && Boolean(formik.errors.poster)}
            helperText={formik.touched.poster && formik.errors.poster}
          />

          <TextField
            fullWidth
            label="Year of Release"
            type="number"
            {...formik.getFieldProps('yearOfRelease')}
            error={formik.touched.yearOfRelease && Boolean(formik.errors.yearOfRelease)}
            helperText={formik.touched.yearOfRelease && formik.errors.yearOfRelease}
          />

          <FormControl fullWidth error={!producer}>
            <InputLabel>Producer</InputLabel>
            <Select
              value={producer}
              label="Producer"
              onChange={(e) => setProducer(e.target.value)}
            >
              {producerList.map((prod) => (
                <MenuItem key={prod._id} value={prod._id}>
                  {prod.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth error={actors.length === 0}>
            <InputLabel>Actors</InputLabel>
            <Select
              multiple
              value={actors}
              label="Actors"
              onChange={(e) => setActors(e.target.value)}
            >
              {actorList.map((actor) => (
                <MenuItem key={actor._id} value={actor._id}>
                  {actor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            type="submit"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Adding Movie...' : 'Add Movie'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default AddMovie;