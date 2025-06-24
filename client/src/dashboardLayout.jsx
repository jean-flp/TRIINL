import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { Outlet } from "react-router-dom";
import customTheme from "./components/themes";

import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/AbcSharp";

import { userStore } from "../src/store/userLogin";

// Navegação por perfil
const NAVIGATION_ADMIN = [
  { kind: "header", title: "Área Usuário" },
  { segment: "login", title: "Login", icon: <DashboardIcon /> },
  { segment: "catalogo", title: "Catálogo", icon: <TimelineIcon /> },
  { segment: "emprestimos", title: "Empréstimos", icon: <TimelineIcon /> },
  { kind: "header", title: "Área Biblioteca" },
  { segment: "cadastroLivro", title: "Cadastro de Livros", icon: <TimelineIcon /> },
  { kind: "header", title: "Administrador" },
  { segment: "admin", title: "Área Administrador", icon: <TimelineIcon /> },
];

const NAVIGATION_USER = [
  { kind: "header", title: "Área Usuário" },
  { segment: "login", title: "Login", icon: <DashboardIcon /> },
  { segment: "catalogo", title: "Catálogo", icon: <TimelineIcon /> },
  { segment: "emprestimos", title: "Empréstimos", icon: <TimelineIcon /> },
];

const NAVIGATION_LIB = [
  { kind: "header", title: "Área Biblioteca" },
  { segment: "cadastroLivro", title: "Cadastro de Livros", icon: <TimelineIcon /> },
];

const NAVIGATION_LOGOFF = [
  { kind: "header", title: "TRIINL" },
];

function AppProviderTheme() {
  const { role, currentAccount } = userStore();

  let navigation;

  if (!currentAccount) {
    navigation = NAVIGATION_LOGOFF;
  } else {
    switch (role) {
      case "admin":
        navigation = NAVIGATION_ADMIN;
        break;
      case "library":
        navigation = NAVIGATION_LIB;
        break;
      case "user":
        navigation = NAVIGATION_USER;
        break;
      default:
        navigation = NAVIGATION_LOGOFF;
    }
  }

  return (
    <AppProvider navigation={navigation} theme={customTheme}>
      <Outlet />
    </AppProvider>
  );
}

export default AppProviderTheme;
