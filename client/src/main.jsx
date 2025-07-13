import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import useMetaMaskListener from "../src/utils/metaMaskListener";

import { userStore } from "../src/store/userLogin";

import App from "./dashboardLayout";
import Layout from "./components/layout";
import Login from "./pages/Login";
import Catalogo from "./pages/Catalogo";
import Emprestimos from "./pages/Emprestimos";
import landingPage from "./pages/landingPage";
import BookForm from "./pages/CadastroLivro";
import Admin from "./pages/admin";

function NavigationHandler() {
  const { isConnected } = userStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  return null;
}

function AppRouter() {
  const { role } = userStore();
  const [router, setRouter] = useState(null);

  useMetaMaskListener();

  useEffect(() => {
    let routes;
    switch (role) {
      case "user":
        routes = [
          {
            Component: App,
            children: [
              {
                path: "/",
                Component: Layout,
                children: [
                  { index: true, Component: landingPage },
                  { path: "/login", Component: Login },
                  { path: "/catalogo", Component: Catalogo },
                  { path: "/emprestimos", Component: Emprestimos },
                  { path: "*", element: <NavigationHandler /> },
                ],
              },
            ],
          },
        ];
        break;

      case "library":
        routes = [
          {
            Component: App,
            children: [
              {
                path: "/",
                Component: Layout,
                children: [
                  { index: true, Component: landingPage },
                  { path: "/login", Component: Login },
                  { path: "/catalogo", Component: Catalogo },
                  { path: "/emprestimos", Component: Emprestimos },
                  { path: "/cadastroLivro", Component: BookForm },
                  { path: "*", element: <NavigationHandler /> },
                ],
              },
            ],
          },
        ];
        break;

      case "admin":
        routes = [
          {
            Component: App,
            children: [
              {
                path: "/",
                Component: Layout,
                children: [
                  { index: true, Component: landingPage },
                  { path: "/login", Component: Login },
                  { path: "/catalogo", Component: Catalogo },
                  { path: "/emprestimos", Component: Emprestimos },
                  { path: "/cadastroLivro", Component: BookForm },
                  { path: "/admin", Component: Admin },
                  { path: "*", element: <NavigationHandler /> },
                ],
              },
            ],
          },
        ];
        break;

      case "unregistered":
        routes = [
          {
            Component: App,
            children: [
              {
                path: "/",
                Component: Layout,
                children: [
                  { index: true, Component: landingPage },
                  { path: "/login", Component: Login },
                  { path: "*", element: <NavigationHandler /> },
                ],
              },
            ],
          },
        ];
        break;

      default:
        routes = [
          {
            Component: App,
            children: [
              {
                path: "/",
                Component: Layout,
                children: [
                  { index: true, Component: landingPage },
                  { path: "*", element: <NavigationHandler /> },
                ],
              },
            ],
          },
        ];
    }

    setRouter(createBrowserRouter(routes));
  }, [role]);

  if (!router) return <div>Carregando...</div>;

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
