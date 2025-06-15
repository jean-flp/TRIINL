// //1.
// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import Login from "./pages/Login.jsx";
// import Emprestimos from "./pages/Emprestimos.jsx";
// import BrowseLibrary from "./pages/Catalogo.jsx";
// import App from "./App.jsx";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );

//2.
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";

import App from "./dashboardLayout";
import Layout from "./components/layout";
import Login from "./pages/Login";
import Catalogo from "./pages/Catalogo";
import Emprestimos from "./pages/Emprestimos";
import landingPage from "./pages/landingPage";
import BookForm from "./pages/CadastroLivro";
import Admin from "./pages/admin";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            index: true,
            Component: landingPage,
          },
          {
            path: "/login",
            Component: Login,
          },
          {
            path: "/catalogo",
            Component: Catalogo,
          },
          {
            path: "/emprestimos",
            Component: Emprestimos,
          },
          {
            path: "/cadastroLivro",
            Component: BookForm,
          },
          {
            path: "/admin",
            Component: Admin ,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
