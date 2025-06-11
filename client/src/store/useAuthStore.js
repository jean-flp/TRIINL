import { create } from "zustand";
import { getRoles, grantRole, hasRole } from "../api/contractFunctions";

//ver historia de jwt com blockchain
export const useAuthStore = create((set) => ({
  user: null, //acho q pode tirar pois ja ta em uyserlogin
  token: null,
  role:null,
  setUser: (userData) => set({ user: userData }),
  setRole: async (contract, address) => {
    try {
      const { admin, library, user } = await getRoles();

      if (await hasRole(contract, admin, address)) {
        set({ role: "admin" });
        return;
      }

      if (await hasRole(contract, library, address)) {
        set({ role: "library" });
        return;
      }

      if (await hasRole(contract, user, address)) {
        set({ role: "user" });
        return;
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error);
      set({ role: "error" });
    }
  },
  setOtherRole: async (contract, signer,role, account) => {
    const { admin, library, user } = await getRoles();
    let variavel;
    switch (role) {
      case "admin":
         variavel = grantRole(contract,admin,account,signer);
        break;
      case "library":
         variavel = grantRole(contract,admin,account,signer);
        break;
      case "user":
        variavel =  grantRole(contract,admin,account,signer);
        break;
      default:
        break;
    }

  }
}));

