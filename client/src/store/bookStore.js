import { create } from "zustand";
import { ethers } from "ethers";
import { getNextBookId, getBook } from "../api/contractFunctions"
import { devtools } from "zustand/middleware"

export const bookStore = create(
    devtools(
        (set) => ({
            books: [],
            totalBooks: 0,
            fetchBooks: async (contract) => {
                try {
                    const books_array = [];
                    const totalBook = await getNextBookId(contract);
                    let temp;
                    for (let index = 0; index < totalBook; index++) {
                        temp = await getBook(contract, index);
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
                    const book = await getBook(contract, id);
                    set((state) => {
                        const updatedBooks = [...state.books];
                        updatedBooks[id] = book;
                        return { books: updatedBooks };
                    });
                } catch (err) {
                    console.error("Erro ao buscar livro:", err);
                }
            },
            addBook: async (contract, signer, book) => {
                try {
                    const newBook = await mint(contract, signer, book.amount, book.title, book.author, book.isbn, book.doi, book.ano, book.uriSuffix);
                    set((state) => ({
                        books: [...state.books, newBook]
                    }));
                    get().fetchBooks();
                } catch (err) {
                    console.error("Erro ao criar um livro:", err);
                }
            },
        })
        , {
            name: "bookStore",
        }
    )
);