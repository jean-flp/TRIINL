import * as React from 'react';
import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider } from '@toolpad/core/AppProvider';

import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/Wallet';
import Stack from '@mui/material/Stack';

import { userStore } from "../store/userLogin";
import {useAuthStore} from "../store/useAuthStore";

export default function authButton(){
   const { currentAccount, isConnected, connectWallet, disconnectWallet } = userStore();
  const { role, setRole } = useAuthStore();

  const [session, setSession] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleConnect = async () => {
    try {
      await connectWallet(); // aguarda a conexão de fato
      const updatedAccount = userStore.getState().currentAccount;
      const updatedContract = userStore.getState().contract;
      console.log(updatedContract.interface.fragments.map(f => f.name)); // veja se tem a função que está tentando usar

      await setRole(updatedContract, updatedAccount);
      const role = useAuthStore.getState().role;
      console.log("ACCOUNT",updatedAccount)
      console.log("CONTRACT",updatedContract)
      console.log("ROLE",role)
    } catch (err) {
      console.error('Erro ao conectar carteira:', err);
      setError('Conexão cancelada ou falhou.');
    }
  };
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession(
          {
            user:{
              name:currentAccount,
              email:role,
            }
          }
        );
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);


    return (
    <Stack direction="row" spacing={2}>
     {isConnected ? (
        <Button variant="outlined" color="error" onClick={disconnectWallet}>
          Desconectar
          <Account/>
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
