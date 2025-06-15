import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { Outlet } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/AbcSharp";

import { createTheme } from "@mui/material/styles";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "login",
    title: "Login",
    icon: <DashboardIcon />,
  },
  {
    segment: "catalogo",
    title: "Catálogo",
    icon: <TimelineIcon />,
  },
  {
    segment: "emprestimos",
    title: "Empréstimos",
    icon: <TimelineIcon />,
  },
  {
    kind: "header",
    title: "Biblioteca",
  },
  {
    segment: "cadastroLivro",
    title: "Cadastro de Livros",
    icon: <TimelineIcon />,
  },
  {
    kind: "header",
    title: "Administrador",
  },
  {
    segment: "admin",
    title: "Administrador",
    icon: <TimelineIcon />,
  },
];
const customTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: "#F9F9FE",
          paper: "#EEEEF9",
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: "#2A4364",
          paper: "#112E4D",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function AppProviderTheme(props) {
  return (
    <AppProvider navigation={NAVIGATION} theme={customTheme}>
      <Outlet />
    </AppProvider>
  );
}
export default AppProviderTheme;
