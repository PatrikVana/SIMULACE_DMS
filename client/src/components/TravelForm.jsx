import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
} from "@mui/material";

const TravelForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    purpose: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        department: "",
        destination: "",
        departureDate: "",
        returnDate: "",
        purpose: "",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Žádost o služební cestu
      </Typography>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Žádost byla úspěšně odeslána.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          {[
            { name: "firstName", label: "Jméno" },
            { name: "lastName", label: "Příjmení" },
            { name: "department", label: "Oddělení" },
            { name: "destination", label: "Destinace" },
            { name: "purpose", label: "Účel cesty" },
          ].map((field) => (
            <Grid item xs={12} key={field.name}>
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
              />
            </Grid>
          ))}

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Datum odjezdu"
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Datum návratu"
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Odeslat žádost
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TravelForm;
