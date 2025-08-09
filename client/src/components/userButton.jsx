import { useEffect, useState, React, useMemo } from "react";
import Logout from "@mui/icons-material/Logout";
import { Account } from "@toolpad/core/Account";
import { AppProvider } from "@toolpad/core/AppProvider";
import customTheme from "./themes";
import Button from "@mui/material/Button";
import WalletIcon from "@mui/icons-material/Wallet";
import Stack from "@mui/material/Stack";
import { userStore } from "../store/userLogin";
import { useNavigate } from "react-router-dom";

export default function AuthButton() {
  const navigate = useNavigate();
  const { currentAccount, isConnected, connectWallet, disconnectWallet, role } =
    userStore();

  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected && currentAccount) {
      const roleLabels = {
        user: "Usuário",
        admin: "Administrador",
        library: "Biblioteca",
        unregistered: "Cadastre seu E-mail!",
        null: "Complete o Cadastro!",
      };

      setSession({
        user: {
          name: currentAccount,
          email: roleLabels[role] || "Carregando...",
          image:
            "https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg",
        },
      });

      if (role === "unregistered") {
        navigate("/login");
      }
    } else {
      setSession(null);
    }
  }, [isConnected, currentAccount, role, navigate]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error("Erro ao conectar carteira:", err);
      setError("Conexão cancelada ou falhou.");
    }
  };

  const authentication = useMemo(
    () => ({
      signIn: () => {},
      signOut: () => {
        disconnectWallet();
      },
    }),
    [disconnectWallet]
  );

  return (
    <Stack direction="row" spacing={2}>
      {!isConnected ? (
        <Button
          onClick={handleConnect}
          variant="contained"
          endIcon={<WalletIcon />}
        >
          Conectar Wallet
        </Button>
      ) : (
        <AppProvider
          authentication={authentication}
          session={session}
          theme={customTheme}
        >
          <Account
            slotProps={{
              signInButton: {
                sx: { display: "none" },
              },
              signOutButton: {
                color: "error",
                startIcon: <Logout />,
              },
              preview: {
                variant: "expanded",
                slotProps: {
                  avatarIconButton: {
                    sx: { width: "fit-content", margin: "auto" },
                  },
                  avatar: { variant: "rounded" },
                },
              },
            }}
          />
        </AppProvider>
      )}
    </Stack>
  );
}
