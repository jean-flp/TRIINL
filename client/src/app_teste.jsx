import { useState, useEffect } from 'react';
import { connectWallet, loadContract } from './utils/web3';
import {contractABI} from "./abi/contractABI";
import {contractAddress} from "./abi/contractAddress"; // ABI do contrato

const CONTRACT_ADDRESS = contractAddress
console.log(CONTRACT_ADDRESS)

function App() {
  //Ver se precisa alterar e como realizar isso
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const init = async () => {
      const { provider, signer } = await connectWallet();
      if (signer) {
        const address = await signer.getAddress();
        setAccount(address);
        const contractInstance = await loadContract(CONTRACT_ADDRESS, contractABI);
        setContract(contractInstance);
      }
    };
    init();
  }, []);

  // Função para chamar um método do contrato (exemplo: leitura)
  const readContract = async () => {
    if (contract) {
      try {
        const data = await contract.suaFuncaoDeLeitura(); // Substitua por sua função
        setResult(data.toString());
      } catch (error) {
        console.error('Erro ao ler o contrato:', error);
      }
    }
  };

  // Função para chamar um método que altera a blockchain (exemplo: escrita)
  const writeContract = async () => {
    if (contract) {
      try {
        const tx = await contract.suaFuncaoDeEscrita('parametro'); // Substitua pela função
        await tx.wait(); // Aguarda a transação ser minerada
        setResult('Transação concluída!');
      } catch (error) {
        console.error('Erro ao escrever no contrato:', error);
      }
    }
  };

  return (
    <div>
      <h1>Minha DApp</h1>
      {account ? (
        <p>Conectado como: {account}</p>
      ) : (
        <button onClick={connectWallet}>Conectar Carteira</button>
      )}
      <button onClick={readContract}>Ler Contrato</button>
      <button onClick={writeContract}>Escrever no Contrato</button>
      <p>Resultado: {result}</p>
    </div>
  );
}

export default App;