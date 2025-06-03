// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrinllModule = buildModule("TRIINL", (m) => {
  const defaultAdminGanache = m.getAccount(0);
  const trinll = m.contract("TRIINL",[defaultAdminGanache],{});

  return { trinll };
});

export default  TrinllModule;
