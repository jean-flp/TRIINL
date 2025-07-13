import { create } from "zustand";
import { ethers } from "ethers";
import {
  deactivateLibrary,
  getAllLibraryAdresses,
} from "../api/contractFunctions";
import { devtools } from "zustand/middleware";

export const libStore = create(
  devtools(
    (set, get) => ({
      libs: [],
      totalLibs: 0,
      fetchLibs: async (contract) => {
        try {
          const libraries_array = [];
          const allLibAdresses = await getAllLibraryAdresses(contract);
          let temp;
          for (const addr of allLibAdresses) {
            try {
              const [name, sigla, email, isActive] =
                await contract.libraries(addr);
              if (name && name.length > 0) {
                libraries_array.push({
                  address: addr,
                  name,
                  sigla,
                  email,
                  isActive,
                });
              }
            } catch (libError) {
              console.warn(
                `Could not fetch details for library ${addr} via mapping getter:`,
                libError.message
              );
            }
          }
          set({
            libs: libraries_array,
          });
        } catch (err) {
          console.error("Erro ao buscar bibliotecas:", err);
        }
      },
      desativarBiblioteca: async (contract, libAddress) => {
        try {
          await deactivateLibrary(contract, libAddress);
          get().fetchLibs();
        } catch (libError) {
          console.log("Erro ao desativar biblioteca", libError);
        }
      },
    }),
    {
      name: "libStore",
    }
  )
);
