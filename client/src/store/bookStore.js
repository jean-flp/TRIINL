import { create } from "zustand";
import { ethers } from "ethers";
import {
  getNextBookId,
  getBook,
  mint,
  getLibrary,
  getUri,
} from "../api/contractFunctions";
import { devtools } from "zustand/middleware";
import { createMetaDado } from "../utils/ipfsAPI";

export const bookStore = create(
  devtools(
    (set, get) => ({
      books: [],
      totalBooks: 0,
      fetchBooks: async (contract) => {
        try {
          const books_array = [];
          const totalBook = await getNextBookId(contract);
          let temp;
          for (let index = 0; index < totalBook; index++) {
            temp = await getBook(contract, index);
            temp = {
              ...temp,
              id: index,
            };
            books_array.push(temp);
          }
          set({
            books: books_array,
            totalBooks: totalBook,
          });
        } catch (err) {
          console.error("Erro ao buscar livros:", err);
        }
      },
      fetchBookById: async (contract, id) => {
        try {
          let book = await getBook(contract, id);
          book = {
            ...book,
            id: id,
          };
          console.log(book);
          return book;
        } catch (err) {
          console.error("Erro ao buscar livro:", err);
        }
      },
      addBook: async (contract, signer, libAddress, book) => {
        try {
          const { name } = await getLibrary(contract, libAddress);
          book.metaUri = await createMetaDado(book, name);

          const newBook = await mint(
            contract,
            signer,
            book.amount,
            book.title,
            book.author,
            book.isbn,
            book.ano,
            book.uriSuffix,
            book.metaUri
          );
          set((state) => ({
            books: [...state.books, newBook],
          }));
          get().fetchBooks(contract);
          return "SUCCESS";
        } catch (err) {
          console.error("Erro ao criar um livro:", err);
          return "ERROR";
        }
      },
    }),
    {
      name: "bookStore",
    }
  )
);
