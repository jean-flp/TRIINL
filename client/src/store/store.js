import { create } from "zustand";

const useStore = create((set) => ({
  escolha: 0,
  setEscolha: (mudaEscolha) => set({ escolha: mudaEscolha }),
}));

export default useStore;
