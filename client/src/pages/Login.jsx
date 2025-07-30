import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { userStore } from "../store/userLogin";
import { Snackbar, Alert } from "@mui/material";

function Login() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const {
    currentAccount,
    contract,
    isConnected,
    token,
    role,
    signer,
    associarEmail,
  } = userStore();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (error) {
      setError("");
    }
  };
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");

      return;
    }
    try {
      // Captura o resultado da função da store
      const result = await associarEmail(contract, signer, email);

      // Verifica o resultado e configura o Snackbar
      if (result === "DOMAIN_NOT_FOUND") {
        setSnackbarMessage(
          "Domínio de e-mail não associado a nenhuma biblioteca."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else if (result === "SUCCESS") {
        // Você pode opcionalmente mostrar uma mensagem de sucesso também
        setSnackbarMessage("Cadastro realizado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      // Trata outros erros, como transação rejeitada
      setSnackbarMessage("Ocorreu um erro ou a transação foi rejeitada.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          Insira seu email institucional
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Institucional"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            error={!!error}
            helperText={error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Cadastre-se
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default Login;
