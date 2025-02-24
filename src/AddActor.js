// // //addactor.js
import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import apiService from "./services/api.service";

function AddActor() {
  const navigate = useNavigate();
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  const handleGenderChange = (e) => {
    setGender(e.target.value);
  };

  const validationSchema = yup.object({
    name: yup.string().required("*Name field is mandatory").min(3),
    bio: yup.string().required("*Bio field is mandatory").min(5),
    image: yup.string().required("*Image field is mandatory").min(5),
    DOB: yup.date().required("*DOB is mandatory"),
  });

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
        await apiService.post("/actors/add-actor", {
          ...values,
          gender,
          DOB: date,
        });
        navigate("/add-movies");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to add actor");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="formGroup">
      {error && <div className="error-message">{error}</div>}
      <TextField
        label="Enter the Actor name"
        variant="outlined"
        {...formik.getFieldProps("name")}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        label="Enter the bio"
        variant="outlined"
        {...formik.getFieldProps("bio")}
        error={formik.touched.bio && Boolean(formik.errors.bio)}
        helperText={formik.touched.bio && formik.errors.bio}
      />
      <TextField
        label="Enter the image link"
        variant="outlined"
        {...formik.getFieldProps("image")}
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
              error={formik.touched.DOB && Boolean(formik.errors.DOB)}
              helperText={formik.touched.DOB && formik.errors.DOB}
            />
          )}
        />
      </LocalizationProvider>
      <FormControl fullWidth>
        <InputLabel>Gender</InputLabel>
        <Select value={gender} label="Gender" onChange={handleGenderChange}>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="others">Others</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" type="submit">
        Add Actor
      </Button>
    </form>
  );
}

export default AddActor;
