import { ethers } from 'ethers';

// Função para conectar com a carteira (ex.: Metamask)
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Solicita acesso à carteira
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error('Erro ao conectar a carteira:', error);
      return null;
    }
  } else {
    console.error('Carteira Web3 não detectada. Instale o Metamask.');
    return null;
  }
};

// Função para carregar o contrato
export const loadContract = async (contractAddress, contractABI) => {
  const { provider, signer } = await connectWallet();
  if (signer) {
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
  // Fallback para leitura apenas (sem carteira)
  const fallbackProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/SUA_CHAVE_INFURA');
  return new ethers.Contract(contractAddress, contractABI, fallbackProvider);
};