import { create } from "zustand";
import { ethers } from "ethers";
import { getContract } from "../utils/web3";
import {
  getRoles,
  getUserEmail,
  grantRole,
  hasRole,
  registerLibrary,
  selfRegisterAsUser,
} from "../api/contractFunctions";
import { devtools } from "zustand/middleware";
import { libStore } from "./libStore";

export const userStore = create(
  devtools(
    (set, get) => ({
      currentAccount: null,
      contract: null,
      isConnected: false,
      token: null,
      role: null,
      signer: null,

      connectWallet: async () => {
        const { isConnected } = get();
        if (isConnected) {
          console.log("Carteira já conectada, evitando reconexão.");
          return;
        }

        if (!window.ethereum) {
          alert("MetaMask não detectado.");
          return;
        }
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
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
        const role = await get().role;

        if (role === "error" || role == null) {
          console.log("Não chegou aqui");
          set({ role: "unregistered" });
        }

        set({
          currentAccount: accounts[0],
          contract: contrato,
          isConnected: true,
          signer: signer,
          role: await get().role,
        });
      },
      disconnectWallet: () => {
        set({
          currentAccount: null,
          contract: null,
          isConnected: false,
          token: null,
          role: null,
        });
      },
      setOtherRole: async (contract, role, account) => {
        const { admin, library, user } = getRoles();
        try {
          switch (role) {
            case "admin":
              await grantRole(contract, admin, account);
              return "ADMIN";
            case "library":
              await grantRole(contract, library, account);
              return "LIBRARY";
            case "user":
              await grantRole(contract, user, account);
              return "USER";
            default:
              break;
          }
        } catch (err) {
          console.log("Erro ao mudar o papel");
          return "ERROR";
        }
      },
      registerLibrary: async (contract, libAddress, name, email, sigla) => {
        try {
          await registerLibrary(contract, libAddress, name, email, sigla);
          return "SUCCESS";
        } catch (err) {
          console.log("Houve um erro ao criar a biblioteca");
          return "ERROR";
        }
      },
      associarEmail: async (contract, signer, email) => {
        try {
          const { libs, fetchLibs } = libStore.getState();
          await fetchLibs(contract);

          const filtered = libs.filter((lib) => {
            const userDomainIndex = email.indexOf("@");
            if (userDomainIndex === -1) {
              return false;
            }
            const userDomain = email.substring(userDomainIndex);
            // Ensure lib.email exists before calling toUpperCase
            return (
              lib.email && lib.email.toUpperCase() === userDomain.toUpperCase()
            );
          });

          console.log(filtered);

          if (filtered.length > 0) {
            const e = await selfRegisterAsUser(contract, signer, email);
            if (e === 1) {
              set({ role: "user" });
              return "SUCCESS";
            }
          } else {
            console.log("Domínio de email não associado a nenhuma biblioteca.");
            return "DOMAIN_NOT_FOUND";
          }
        } catch (err) {
          console.error(
            "O usuário rejeitou a transação ou ocorreu um erro:",
            err
          );
          set({ role: null }); // Ensure the role is null on failure
        }
      },
      getEmail: async (contract, userAddress) => {
        try {
          const email = getUserEmail(contract, userAddress);
          return email;
        } catch (err) {
          console.log("Houve um erro ao buscar o email do usuário");
        }
      },
    }),
    {
      name: "userStore",
    }
  )
);
