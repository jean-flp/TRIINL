import { create} from "zustand";
import { ethers } from "ethers";
import { getContract } from "../utils/web3";
import { getRoles, grantRole, hasRole,registerLibrary,selfRegisterAsUser  } from "../api/contractFunctions";
import { devtools } from "zustand/middleware"

export const userStore = create(
  devtools(
    (set,get) => ({
      currentAccount: null,
      contract: null,
      isConnected: false,
      token: null,
      role: null,
      signer:null,

      connectWallet: async () => {
        if (!window.ethereum) {
          alert("MetaMask não detectado.");
          return;
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contrato = await getContract(signer);

        console.log("Conta:", accounts[0]);
         try {
          const { admin, library, user } = getRoles();
           console.log("🧩 Roles carregadas:", { admin, library, user });
           if (await hasRole(contrato, user, accounts[0])) {
             set({ role: "user" });
           }
           if (await hasRole(contrato, library, accounts[0])) {
             set({ role: "library" });
           }
           if (await hasRole(contrato, admin, accounts[0])) {
             set({ role: "admin" });
           }
         } catch (error) {
           console.error("Erro ao verificar role:", error);
           set({ role: "error" });
         }
        const role = get().role;
        if( role === "error"|| role == null ){
          await selfRegisterAsUser(contrato,signer);
          set({role:"user"});
        }

        set({
          currentAccount: accounts[0],
          contract: contrato,
          isConnected: true,
          signer:signer,
        });
      },
      disconnectWallet: () =>
        set({
          currentAccount: null,
          contract: null,
          isConnected: false,
          token: null,
          role: null,
        }),
      setOtherRole: async (contract, role, account) => {
        const { admin, library, user } = getRoles();
        switch (role) {
          case "admin":
            grantRole(contract, admin, account);
            break;
          case "library":
            grantRole(contract, library, account);
            break;
          case "user":
            grantRole(contract, user, account);
            break;
          default:
            break;
        }
      },
      registerLibrary: async (contract, libAddress, name, sigla)=>{
        await registerLibrary(contract, libAddress, name, sigla);
      },

    })
    ,
    {
      name: "userStore",
    }
  )
);
