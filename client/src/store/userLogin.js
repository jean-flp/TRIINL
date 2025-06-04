import { create } from "zustand";
import { ethers } from "../../node_modules/ethers";
import {contractABI} from "../abi/contractABI";
console.log("ABI carregado:", contractABI);




const contractAddress = import.meta.env.VITE_CONTRACT
console.log("Contract Address:", contractAddress);

export const useStore = create((set) => ({
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
    const signer = await provider.getSigner();
    const contrato = new ethers.Contract(contractAddress, contractABI, signer);

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
}));
