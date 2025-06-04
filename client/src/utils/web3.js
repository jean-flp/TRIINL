import { ethers } from "ethers";
import {contractABI} from "../abi/contractABI";
import { contractAddress } from "../abi/contractAddress"; 

export async function getContract() {
  if (!window.ethereum) {
    alert("Por favor, instale o MetaMask.");
    return null;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  return contract;
}