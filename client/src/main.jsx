import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./pages/Login.jsx";
import Emprestimos from "./pages/Emprestimos.jsx";
import BrowseLibrary from "./pages/Catalogo.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowseLibrary />
  </StrictMode>
);
