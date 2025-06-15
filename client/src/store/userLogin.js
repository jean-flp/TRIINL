import { create } from "zustand";
import { ethers } from "ethers";
import { getContract } from "../utils/web3";
import {devtools} from "zustand/middleware"

 export const userStore = create(
  devtools(
  (set) => ({
  currentAccount: null,
  contract: null,
  isConnected: false,

  connectWallet: async () => {
    if (!window.ethereum) {
      alert("MetaMask não detectado.");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contrato = await getContract(signer);
    console.log("Conta:",accounts[0]);
    set({
      currentAccount: accounts[0],
      contract: contrato,
      isConnected: true,
    });
  },

  disconnectWallet: () =>
    set({
      currentAccount: null,
      contract: null,
      isConnected: false,
    }),
})
  ,
  {
    name: "userStore",
  }
)
);
