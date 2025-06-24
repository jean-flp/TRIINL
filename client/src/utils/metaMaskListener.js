import { useEffect } from "react";
import { userStore } from "../store/userLogin"; // exemplo de Zustand

function useMetaMaskListener() {
  const {connectWallet} = userStore();  // sua função para atualizar o estado
  const {disconnectWallet} = userStore();            // uma função que reseta estado ao desconectar

  useEffect(() => {
    if (window.ethereum) {
      // Detecta troca de conta
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          console.log("MetaMask desconectado");
          disconnectWallet(); // limpa o estado da conta/logado
        } else {
          //connectWallet();
          console.log("Conta trocada para:", accounts[0]);
        }
      };

      // Detecta troca de rede
      const handleChainChanged = (chainId) => {
        console.log("Rede alterada:", chainId);
        // Atualize ou recarregue o app, se necessário
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [connectWallet, disconnectWallet]);
}

export default useMetaMaskListener;

