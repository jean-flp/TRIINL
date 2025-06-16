const fs = require('fs');
const path = require('path');

// Caminho para o arquivo deployments e o arquivo de destino (exemplo: .env)
const deploymentsPath = path.join(__dirname,'ignition','deployments', 'chain-1337', 'deployed_addresses.json');
const outputPath = path.join(__dirname, '../../.env');  // pode ser outro arquivo que você queira


// Lê o arquivo JSON dos endereços
const deployedData = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
// Supondo que a chave seja "TRIINL#TRIINL" como no seu exemplo:
const contractKey = "TRIINL#TRIINL";

if (!(contractKey in deployedData)) {
  console.error(`Chave ${contractKey} não encontrada no arquivo de deployed_addresses`);
  process.exit(1);
}

const contractAddress = deployedData[contractKey];

// Escreve no arquivo .env o endereço no formato esperado
const envLine = `VITE_CONTRACT=${contractAddress}\n`;

// Se quiser preservar o arquivo mas atualizar só essa variável (leitura + replace), aqui é só um exemplo simples que sobrescreve o arquivo todo:
fs.writeFileSync(outputPath, envLine);

console.log(`Endereço ${contractAddress} salvo em ${outputPath}`);
