import * as React from 'react';
import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider } from '@toolpad/core/AppProvider';

import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/Wallet';
import Stack from '@mui/material/Stack';

import { userStore } from "../store/userLogin";

export default function authButton(){
    const enderecoConta = userStore((state) => state.currentAccount);
    const contrato = userStore((state) => state.contract);
    const isConnected = userStore((state) => state.isConnected);
    const connectWallet = userStore((state) => state.connectWallet);
    const disconnectWallet = userStore((state) => state.disconnectWallet);

    const [error, setError] = React.useState(null);

  const handleConnect = async () => {
    try {
      await connectWallet(); // aguarda a conexão de fato
    } catch (err) {
      console.error('Erro ao conectar carteira:', err);
      setError('Conexão cancelada ou falhou.');
    }
  };


    return (
    <Stack direction="row" spacing={2}>
     {isConnected ? (
        <Button variant="outlined" color="error" onClick={disconnectWallet}>
          Desconectar
        </Button>
      ) : (
        <Button onClick={handleConnect} variant="contained" endIcon={<WalletIcon />}>
          Conectar Wallet
        </Button>
      )}
    </Stack>
  );
}

// export default function AccountCustomSlotProps() {
   

//     const [session, setSession] = React.useState(
//         {
//             user: {
//                 endereco: enderecoConta,
//                 image: 'https://avatars.githubusercontent.com/u/19550456',
//             },
//         }
//     );

//     const authentication = React.useMemo(() => {
//         return {
//             signIn: () => {
//                 setSession({
//                     user: {
//                         name: enderecoConta,
//                         image: 'https://avatars.githubusercontent.com/u/19550456',
//                     },
//                 });
//             },
//             signOut: () => {
//                 setSession(null);
//             },
//         };
//     }, []);

//     return (
//         <AppProvider authentication={authentication} session={session}>
//             {/* preview-start */}
//             <Account
//                 slotProps={{
//                     signInButton: {
//                         color: 'success',
//                     },
//                     signOutButton: {
//                         color: 'success',
//                         startIcon: <Logout />,
//                     },
//                     preview: {
//                         variant: 'expanded',
//                         slotProps: {
//                             avatarIconButton: {
//                                 sx: {
//                                     width: 'fit-content',
//                                     margin: 'auto',
//                                 },
//                             },
//                             avatar: {
//                                 variant: 'rounded',
//                             },
//                         },
//                     },
//                 }}
//             />
//             {/* preview-end */}
//         </AppProvider>
//     );
// }

// export default function button(){
//     return(
//         <div>
//             <button>
//                 ALO
//             </button>
//         </div>
//     );
// }
