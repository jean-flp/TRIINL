// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrinllModule = buildModule("TrinllModule", (m) => {
  const trinll = m.contract("TRINLL");

  return { trinll };
});

export default  TrinllModule;
