import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StorefrontIcon from "@mui/icons-material/Storefront";
import img from "../assets/biblioteca.jpg";

function LandingPage() {
  return (
    <Box
      sx={{
        // This is the key change
        height: {
          xs: "calc(100vh - 56px)", // AppBar height on mobile
          sm: "calc(100vh - 64px)", // AppBar height on desktop
        },
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${img})`,
        color: "white",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Title */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          TRIINL: A Biblioteca Descentralizada
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h5"
          component="p"
          sx={{
            mb: 4,
            maxWidth: "500px",
            mx: "auto",
            textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          Pegue livros de outras bibliotecas universitárias usando a tecnologia
          blockchain.
        </Typography>

        {/* "How it Works" Section */}
        <Paper
          elevation={12}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Translucent white
            backdropFilter: "blur(10px)", // Frosted glass effect
            color: "white",
            padding: { xs: 2, md: 4 },
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "600", mb: 4 }}
          >
            Como Funciona
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* Step 1 */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 50, color: "primary.main" }}
                />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                >
                  1. Conecte-se
                </Typography>
                <Typography>
                  Conecte sua carteira digital (como a MetaMask) para criar sua
                  identidade na nossa rede.
                </Typography>
              </Stack>
            </Grid>

            {/* Step 2 */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <MenuBookIcon sx={{ fontSize: 50, color: "primary.main" }} />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                >
                  2. Solicite um Livro
                </Typography>
                <Typography>
                  Navegue pelo acervo de livros disponíveis em outras
                  instituições e solicite o empréstimo do título que desejar.
                </Typography>
              </Stack>
            </Grid>

            {/* Step 3 */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <StorefrontIcon sx={{ fontSize: 50, color: "primary.main" }} />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: "bold" }}
                >
                  3. Retire na Biblioteca
                </Typography>
                <Typography>
                  Após a aprovação, dirija-se à biblioteca da instituição
                  correspondente para retirar seu livro. Todo o processo é
                  registrado na blockchain.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default LandingPage;
