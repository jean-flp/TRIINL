import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { Outlet } from "react-router-dom";

import customTheme from "./components/themes";

import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/AbcSharp";

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


function AppProviderTheme(props) {
  return (
    <AppProvider navigation={NAVIGATION} theme={customTheme}>
      <Outlet />
    </AppProvider>
  );
}
export default AppProviderTheme;
