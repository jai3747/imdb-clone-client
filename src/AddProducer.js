// // //addproducker.js
import React, { useState } from "react";
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
  Typography
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import apiService from './services/api.service';

const validationSchema = yup.object({
  name: yup.string().required("Name field is mandatory").min(3),
  bio: yup.string().required("Bio field is mandatory").min(5),
  image: yup.string().required("Image field is mandatory").min(5),
  DOB: yup.date().required("Date of Birth is mandatory"),
});

function AddProducer() {
  const navigate = useNavigate();
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      bio: "",
      image: "",
      DOB: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const date = values.DOB.toISOString().slice(0, 10);
        await apiService.post('/producers/add-producer', {
          ...values,
          gender,
          DOB: date,
        });
        navigate("/add-movies");
      } catch (err) {
        setError(err.message || "Failed to add producer");
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Producer
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Producer Name"
            {...formik.getFieldProps('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            {...formik.getFieldProps('bio')}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={formik.touched.bio && formik.errors.bio}
          />

          <TextField
            fullWidth
            label="Image URL"
            {...formik.getFieldProps('image')}
            error={formik.touched.image && Boolean(formik.errors.image)}
            helperText={formik.touched.image && formik.errors.image}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date of Birth"
              value={formik.values.DOB}
              onChange={(value) => formik.setFieldValue("DOB", value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={formik.touched.DOB && Boolean(formik.errors.DOB)}
                  helperText={formik.touched.DOB && formik.errors.DOB}
                />
              )}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="others">Others</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            type="submit"
            size="large"
            sx={{ mt: 2 }}
          >
            Add Producer
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default AddProducer;