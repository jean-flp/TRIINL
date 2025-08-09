import { create } from "zustand";
import { ethers } from "ethers";
import {
  requestLoanAndGetId,
  getLoanRequest,
  approveLoan,
  returnLoan,
  getNextLoanId,
  bookWithUser,
  rejectLoan,
} from "../api/contractFunctions";
import { devtools } from "zustand/middleware";
import { bookStore } from "../store/bookStore";

export const loanStore = create(
  devtools(
    (set, get) => ({
      loans: [],
      totalLoans: 0,
      fetchLoans: async (contract) => {
        try {
          const { fetchBookById } = bookStore.getState();
          const loans_array = [];
          const totalLoan = await getNextLoanId(contract);
          let temp;
          for (let index = 0; index < totalLoan; index++) {
            temp = await getLoanRequest(contract, index);
            temp = {
              ...temp,
              id: index,
            };
            if (temp.bookId !== undefined && temp.bookId !== null) {
              const livro = await fetchBookById(contract, temp.bookId);
              const loanInteiro = {
                ...temp,
                book: { ...livro },
              };
              if (loanInteiro !== undefined && loanInteiro !== null) {
                loans_array.push(loanInteiro);
              } else {
                loans_array.push(temp);
              }
            }
          }
          set({
            loans: loans_array,
            totalLoans: totalLoan,
          });
        } catch (err) {
          console.error("Erro ao buscar livros:", err);
        }
      },
      fetchLoansById: async (contract, id) => {
        try {
          const loan = await getLoan(contract, id);
          set((state) => {
            const updatedLoans = [...state.loans];
            updatedLoans[id] = loan;
            return { loans: updatedLoans };
          });
        } catch (err) {
          console.error("Erro ao buscar livro:", err);
        }
      },
      requestLoan: async (contract, signer, book) => {
        try {
          const newLoan = await requestLoanAndGetId(
            contract,
            signer,
            book.instituicao,
            book.id,
            1
          );
          set((state) => ({
            loans: [...state.loans, newLoan],
          }));
          get().fetchLoans(contract, signer);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao criar um emprestimo:", err);
          return "ERROR";
        }
      },
      acceptLoan: async (contract, loanId, signer) => {
        try {
          await approveLoan(contract, loanId, signer);
          get().fetchLoans(contract, signer);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao aprovar um emprestimo:", err);
          return "ERROR";
        }
      },
      returnLoan: async (contract, signer, loanId) => {
        try {
          await returnLoan(contract, signer, loanId);
          get().fetchLoans(contract, signer);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao retornar um emprestimo:", err);
          return "ERROR";
        }
      },
      loanWithUser: async (contract, signer, loanId) => {
        try {
          await bookWithUser(contract, signer, loanId);
          get().fetchLoans(contract, signer);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao atualizar status de um emprestimo:", err);
          return "ERROR";
        }
      },
      rejectLoan: async (contract, signer, loanId) => {
        try {
          await rejectLoan(contract, signer, loanId);
          get().fetchLoans(contract, signer);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao rejeitar de um emprestimo:", err);
          return "ERROR";
        }
      },
    }),
    {
      name: "loanStore",
    }
  )
);
