import * as React from 'react';
import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider } from '@toolpad/core/AppProvider';
import customTheme from './themes';
import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/Wallet';
import Stack from '@mui/material/Stack';

import { userStore } from "../store/userLogin";

export default function AuthButton() {
  const {
    currentAccount,
    isConnected,
    connectWallet,
    disconnectWallet,
    role,
  } = userStore();

  const [session, setSession] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleConnect = async () => {
    try {
      await connectWallet();
      const updatedAccount = userStore.getState().currentAccount;
      const updatedContract = userStore.getState().contract;
      const updatedRole = userStore.getState().role;

      const roleLabels = {
        user: "Usuário",
        admin: "Administrador",
        library: "Biblioteca",
      };
      // Sessão criada com nome e role
      setSession({
        user: {
          name: updatedAccount,
          email: roleLabels[updatedRole],
          image: 'https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg',
        },
      });
    } catch (err) {
      console.error("Erro ao conectar carteira:", err);
      setError("Conexão cancelada ou falhou.");
    }
  };

  // Fake auth (só para que AppProvider aceite session)
  const authentication = React.useMemo(
    () => ({
      signIn: () => {},
      signOut: () => {
        disconnectWallet();
        setSession(null);
      },
    }),
    []
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
        <AppProvider authentication={authentication} session={session} theme={customTheme}>
          <Account
            slotProps={{
              signInButton: {
                sx:{display:"none"},
               },

              // Oculta o botão de logout
              signOutButton: {
                color: 'error',
                startIcon: <Logout />,
              },
              preview: {
                variant: 'expanded',
                slotProps: {
                  avatarIconButton: {
                    sx: { width: 'fit-content', margin: 'auto' },
                  },
                  avatar: { variant: 'rounded' },
                },
              },
            }}
          />
        </AppProvider>
      )}
    </Stack>
  );
}
