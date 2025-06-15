import { ethers } from "ethers";
import {contractABI} from "../abi/contractABI";
console.log("ABI carregado:", contractABI);
const contractAddress = import.meta.env.VITE_CONTRACT
console.log("Contract Address:", contractAddress);

export async function getContract(signer) {
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  console.log("SOU O CONTRATO:",contract);
  return contract;
}