import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

//key -> 0x<key1>,0x<key2>,0x<key3>, ... ,0x<key_n>
//const privateKeys = (process.env.PRIVATE_KEY || "").split(",").map(k => k.trim());

//mnemonic -> trash meat globe gasp path detect gain lounge cotton learn talk police
const MNEMONIC = process.env.MNEMONIC || "";

// key
// const config: HardhatUserConfig = {
//   solidity: "0.8.27",
//   networks: {
//     Ganache: {
//       url: process.env.PROVIDER_URL,
//       accounts: privateKeys,
//     }
//   }
// };

//mnemonic
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // valor baixo para otimizar o tamanho do bytecode
      }
    }
  },
  networks: {
    Ganache: {
      url: process.env.PROVIDER_URL,
      accounts: {
        mnemonic: MNEMONIC
      }
    }
  }
};

export default config;
