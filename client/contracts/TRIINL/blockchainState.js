const { ethers } = require("hardhat");

async function main() {
  const provider = ethers.provider;

  const blockNumber = await provider.getBlockNumber();
  const gasPrice = await provider.getFeeData();
  const network = await provider.getNetwork();

  console.log("🧠 Último bloco:", blockNumber);
  console.log("⚡ Gas price:", gasPrice.gasPrice.toString());
  console.log("🌐 Chain ID:", network.chainId);

  const accounts = await ethers.getSigners();
  console.log("📜 Contas e saldos:");
  for (const acc of accounts) {
    const balance = await provider.getBalance(acc.address);
    console.log(`→ ${acc.address} | ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch(console.error);
