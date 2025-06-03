import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./pages/Login.jsx";
import Emprestimos from "./pages/Emprestimos.jsx";
import BrowseLibrary from "./pages/Catalogo.jsx";
import App from "./App.jsx";; //"./app_teste.jsx";//"./App.jsx"; //"./app_2.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
