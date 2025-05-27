import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
  Grid,
  Divider,
} from "@mui/material";

const ReviewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        query {
          requests {
            id
            firstName
            lastName
            department
            destination
            approved
            timestamp
          }
        }
      `;
      const res = await fetch("http://localhost:5000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      setRequests(json.data.requests.filter((r) => r.approved === null));
    };

    fetchData();
  }, []);

  const handleAction = async (id, approve) => {
    await fetch(`http://localhost:5000/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approve }),
    });
    setSelected(null);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Žádosti ke schválení
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <List>
          {requests.map((req) => (
            <ListItem
              key={req.id}
              secondaryAction={
                <Button
                  variant="outlined"
                  onClick={() => setSelected(req)}
                  size="small"
                >
                  Zobrazit
                </Button>
              }
            >
              <ListItemText
                primary={`${req.firstName} ${req.lastName}`}
                secondary={`Destinace: ${req.destination}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {selected && (
        <Paper elevation={4} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detail žádosti
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>
                <strong>Jméno:</strong> {selected.firstName} {selected.lastName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Oddělení:</strong> {selected.department}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Destinace:</strong> {selected.destination}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                <strong>Odesláno:</strong>{" "}
                {new Date(selected.timestamp).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAction(selected.id, true)}
            >
              Schválit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleAction(selected.id, false)}
            >
              Zamítnout
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReviewRequests;
