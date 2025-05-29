// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract LibraryToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {
    bytes32 public constant LIBRARY_ROLE = keccak256("LIBRARY_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    struct Book {
        string title;
        string author;
        string isbn;
        string doi;
        string ano;
        string uri;
    }
    mapping(uint256 => Book) public books;

    enum LoanStatus { PENDING, APPROVED, RETURNED }
    struct LoanRequest {
        address user;
        address libraryFrom;
        uint256 bookId;
        uint256 amount;
        LoanStatus status;
    }

    mapping(uint256 => LoanRequest) public loanRequests;
    uint256 public nextLoanId;
    mapping(address => bool) public isLibrary;

    event LoanRequested(uint256 loanId, address user, address libraryFrom, uint256 bookId, uint256 amount);
    event LoanApproved(uint256 loanId, address libraryFrom);
    event LoanReturned(uint256 loanId, address libraryFrom);
    event BookCreated(uint256 bookId, string title, string author, string isbn, string doi, string ano, string uri);
    event LibraryRegistered(address libraryAddress);

    constructor(address defaultAdmin)
        ERC1155("https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(LIBRARY_ROLE, defaultAdmin);
        _setRoleAdmin(LIBRARY_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    // Registrar uma biblioteca
    function registerLibrary(address libraryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!isLibrary[libraryAddress], "Address is already a library");
        isLibrary[libraryAddress] = true;
        _grantRole(LIBRARY_ROLE, libraryAddress);
        emit LibraryRegistered(libraryAddress);
    }

    // Definir URI base (Pinata)
    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    // Pausar contrato
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    // Despausar contrato
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Criar novo livro (token) com metadados
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        string memory title,
        string memory author,
        string memory isbn,
        string memory doi,
        string memory ano,
        string memory uri
    ) public onlyRole(LIBRARY_ROLE) {
        require(isLibrary[account], "Recipient must be a library");
        require(bytes(books[id].title).length == 0, "Book ID already exists");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(author).length > 0, "Author cannot be empty");
        books[id] = Book({
            title: title,
            author: author,
            isbn: isbn,
            doi: doi,
            ano: ano,
            uri: uri
        });
        _mint(account, id, amount,"0x");//, data
        emit BookCreated(id, title, author, isbn, doi, ano, uri);
    }

    // Criar múltiplos livros com metadados
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        Book[] memory bookData
    ) public onlyRole(LIBRARY_ROLE) {
        require(isLibrary[to], "Recipient must be a library");
        require(ids.length == bookData.length, "Mismatched input arrays");
        require(ids.length == amounts.length, "Mismatched input arrays");
        for (uint256 i = 0; i < ids.length; i++) {
            require(bytes(books[ids[i]].title).length == 0, "Book ID already exists");
            require(bytes(bookData[i].title).length > 0, "Title cannot be empty");
            require(bytes(bookData[i].author).length > 0, "Author cannot be empty");
            books[ids[i]] = bookData[i];
            emit BookCreated(
                ids[i],
                bookData[i].title,
                bookData[i].author,
                bookData[i].isbn,
                bookData[i].doi,
                bookData[i].ano,
                bookData[i].uri
            );
        }
        _mintBatch(to, ids, amounts,"0x");
    }

    // Recuperar metadados de um livro
    function getBook(uint256 bookId) public view returns (Book memory) {
        require(bytes(books[bookId].title).length > 0, "Book does not exist");
        return books[bookId];
    }

    // Requisitar empréstimo
    function requestLoan(address libraryFrom, uint256 bookId, uint256 amount)
        public
        onlyRole(USER_ROLE)
        returns (uint256)
    {
        require(isLibrary[libraryFrom], "Not a valid library");
        require(bytes(books[bookId].title).length > 0, "Book does not exist");
        require(balanceOf(libraryFrom, bookId) >= amount, "Library does not have enough books");
        uint256 loanId = nextLoanId++;
        loanRequests[loanId] = LoanRequest({
            user: msg.sender,
            libraryFrom: libraryFrom,
            bookId: bookId,
            amount: amount,
            status: LoanStatus.PENDING
        });
        emit LoanRequested(loanId, msg.sender, libraryFrom, bookId, amount);
        return loanId;
    }

    // Aprovar empréstimo
    function approveLoan(uint256 loanId) public onlyRole(LIBRARY_ROLE) {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.libraryFrom == msg.sender, "Only the requested library can approve");
        require(loan.status == LoanStatus.PENDING, "Loan is not pending");
        require(balanceOf(msg.sender, loan.bookId) >= loan.amount, "Not enough books in library");
        loan.status = LoanStatus.APPROVED;
        emit LoanApproved(loanId, msg.sender);
    }

    // Devolver empréstimo
    function returnLoan(uint256 loanId) public onlyRole(USER_ROLE) {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.user == msg.sender, "Only the borrower can return");
        require(loan.status == LoanStatus.APPROVED, "Loan is not approved");
        loan.status = LoanStatus.RETURNED;
        emit LoanReturned(loanId, loan.libraryFrom);
    }

    // Transferência entre bibliotecas
    function transferBetweenLibraries(address from, address to, uint256 id, uint256 amount, bytes memory data)
        public
        onlyRole(LIBRARY_ROLE)
    {
        require(isLibrary[from] && isLibrary[to], "Both addresses must be libraries");
        require(bytes(books[id].title).length > 0, "Book does not exist");
        safeTransferFrom(from, to, id, amount, data);
    }

    // Restringir transferências apenas entre bibliotecas
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        if (from != address(0) && to != address(0)) { // Ignorar mint/burn
            require(isLibrary[from] && isLibrary[to], "Transfers only allowed between libraries");
            for (uint256 i = 0; i < ids.length; i++) {
                require(bytes(books[ids[i]].title).length > 0, "Book does not exist");
            }
        }
        super._update(from, to, ids, values);
    }

    // Suporte a interfaces
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// pragma solidity ^0.8.27;

// import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
// import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
// import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
// import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

// contract LibraryToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {

//     bytes32 public constant LIBRARY_ROLE = keccak256("LIBRARY_ROLE");
//     bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

//     struct Book {
//         string title;
//         string author;
//         string isbn;
//         string doi;
//         string ano;
//         string uri;
//     }
//     mapping(uint256 => Book) public books;

//     enum LoanStatus { PENDING, APPROVED, RETURNED }
//     struct LoanRequest {
//         address user;
//         address libraryFrom;
//         uint256 bookId;
//         uint256 amount;
//         LoanStatus status;
//     }

//     mapping(uint256 => LoanRequest) public loanRequests;
//     uint256 public nextLoanId;
//     mapping(address => bool) public isLibrary;

//     event LoanRequested(uint256 loanId, address user, address libraryFrom, uint256 bookId, uint256 amount);
//     event LoanApproved(uint256 loanId, address libraryFrom);
//     event LoanReturned(uint256 loanId, address libraryFrom);
//     event BookCreated(uint256 bookId, string title, string author, string isbn, string doi, string ano, string uri);
//     event LibraryRegistered(address libraryAddress);

//     constructor(address defaultAdmin)
//         ERC1155("https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/")
//     {
//         _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
//         _setRoleAdmin(LIBRARY_ROLE, DEFAULT_ADMIN_ROLE);
//         _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);
//     }

//     function registerLibrary(address libraryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
//         require(!isLibrary[libraryAddress], "Address is already a library");
//         isLibrary[libraryAddress] = true;
//         _grantRole(LIBRARY_ROLE, libraryAddress);
//         emit LibraryRegistered(libraryAddress);
//     }

//     function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
//         _setURI(newuri);
//     }
//     function setLibrary(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
//         _setURI(newuri);
//     }
//     function setUser(string memory newuri) public onlyRole(LIBRARY_ROLE) {
//         _setURI(newuri);
//     }

//     function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
//         _pause();
//     }

//     function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
//         _unpause();
//     }

//     // function mint(address account, uint256 id, uint256 amount, bytes memory data)
//     //     public
//     //     onlyRole(LIBRARY_ROLE)
//     // {
//     //     require(isLibrary[account], "Recipient must be a library");
//     //     _mint(account, id, amount, data);
//     // }

//     // function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
//     //     public
//     //     onlyRole(LIBRARY_ROLE)
//     // {
//     //     require(isLibrary[to], "Recipient must be a library");
//     //     _mintBatch(to, ids, amounts, data);
//     // }

//     function mint(
//         address account,
//         uint256 id,
//         uint256 amount,
//         string memory title,
//         string memory author,
//         string memory isbn,
//         string memory doi,
//         string memory ano,
//         string memory uri,
//         bytes memory data
//     ) public onlyRole(LIBRARY_ROLE) {
//         require(isLibrary[account], "Recipient must be a library");
//         require(bytes(books[id].title).length == 0, "Book ID already exists");
//         books[id] = Book({
//             title: title,
//             author: author,
//             isbn: isbn,
//             doi: doi,
//             ano: ano,
//             uri: uri
//         });
//         _mint(account, id, amount, data);
//         emit BookCreated(id, title, author, isbn, doi, ano, uri);
//     }

//     // Criar múltiplos livros com metadados
//     function mintBatch(
//         address to,
//         uint256[] memory ids,
//         uint256[] memory amounts,
//         Book[] memory bookData,
//         bytes memory data
//     ) public onlyRole(LIBRARY_ROLE) {
//         require(isLibrary[to], "Recipient must be a library");
//         require(ids.length == bookData.length, "Mismatched input arrays");
//         for (uint256 i = 0; i < ids.length; i++) {
//             require(bytes(books[ids[i]].title).length == 0, "Book ID already exists");
//             books[ids[i]] = bookData[i];
//             emit BookCreated(
//                 ids[i],
//                 bookData[i].title,
//                 bookData[i].author,
//                 bookData[i].isbn,
//                 bookData[i].doi,
//                 bookData[i].ano,
//                 bookData[i].uri
//             );
//         }
//         _mintBatch(to, ids, amounts, data);
//     }


//     function requestLoan(address libraryFrom, uint256 bookId, uint256 amount)
//         public
//         onlyRole(USER_ROLE)
//         returns (uint256)
//     {
//         require(isLibrary[libraryFrom], "Not a valid library");
//         require(balanceOf(libraryFrom, bookId) >= amount, "Library does not have enough books");
//         uint256 loanId = nextLoanId++;
//         loanRequests[loanId] = LoanRequest({
//             user: msg.sender,
//             libraryFrom: libraryFrom,
//             bookId: bookId,
//             amount: amount,
//             status: LoanStatus.PENDING
//         });
//         emit LoanRequested(loanId, msg.sender, libraryFrom, bookId, amount);
//         return loanId;
//     }

//     function approveLoan(uint256 loanId) public onlyRole(LIBRARY_ROLE) {
//         LoanRequest storage loan = loanRequests[loanId];
//         require(loan.libraryFrom == msg.sender, "Only the requested library can approve");
//         require(loan.status == LoanStatus.PENDING, "Loan is not pending");
//         require(balanceOf(msg.sender, loan.bookId) >= loan.amount, "Not enough books in library");
//         loan.status = LoanStatus.APPROVED;
//         emit LoanApproved(loanId, msg.sender);
//     }

//     function returnLoan(uint256 loanId) public onlyRole(USER_ROLE) {
//         LoanRequest storage loan = loanRequests[loanId];
//         require(loan.user == msg.sender, "Only the borrower can return");
//         require(loan.status == LoanStatus.APPROVED, "Loan is not approved");
//         loan.status = LoanStatus.RETURNED;
//         emit LoanReturned(loanId, loan.libraryFrom);
//     }

//     function transferBetweenLibraries(address from, address to, uint256 id, uint256 amount, bytes memory data)
//         public
//         onlyRole(LIBRARY_ROLE)
//     {
//         require(isLibrary[from] && isLibrary[to], "Both addresses must be libraries");
//         safeTransferFrom(from, to, id, amount, data);
//     }

//     function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
//         internal
//         override(ERC1155, ERC1155Pausable, ERC1155Supply)
//     {
//         if (from != address(0) && to != address(0)) { // Ignorar mint/burn
//             require(isLibrary[from] && isLibrary[to], "Transfers only allowed between libraries");
//         }
//         super._update(from, to, ids, values);
//     }

//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         override(ERC1155, AccessControl)
//         returns (bool)
//     {
//         return super.supportsInterface(interfaceId);
//     }
//     function _isLibrary(address account) public virtual view returns(bool) {
//         return hasRole(LIBRARY_ROLE,account);
//     }
//     function _isUser(address account) public virtual view returns(bool) {
//         return hasRole(USER_ROLE,account);
//     }
//     function _isAdmin(address account) public virtual view returns(bool) {
//         return hasRole(DEFAULT_ADMIN_ROLE,account);
//     }
// }

// pragma solidity ^0.8.27;

// import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
// import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
// import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
// import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

// contract LibraryToken is ERC1155, AccessControl, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {
//     bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
//     bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
//     bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
//     bytes32 public constant LIBRARY_ROLE = keccak256("LIBRARY_ROLE");
//     bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

//     // Estrutura para metadados do livro
//     struct Book {
//         string title;
//         string author;
//         string isbn;
//         string doi;
//         string ano;
//         string uri;
//     }

//     // Mapeamento para armazenar metadados do livro por bookId
//     mapping(uint256 => Book) public books;

//     // Estrutura para pedidos de empréstimo
//     enum LoanStatus { PENDING, APPROVED, RETURNED }
//     struct LoanRequest {
//         address user;
//         address libraryFrom;
//         uint256 bookId;
//         uint256 amount;
//         LoanStatus status;
//     }

//     mapping(uint256 => LoanRequest) public loanRequests;
//     uint256 public nextLoanId;
//     mapping(address => bool) public isLibrary;

//     event LoanRequested(uint256 loanId, address user, address libraryFrom, uint256 bookId, uint256 amount);
//     event LoanApproved(uint256 loanId, address libraryFrom);
//     event LoanReturned(uint256 loanId, address libraryFrom);
//     event LibraryRegistered(address libraryAddress);
//     event BookCreated(uint256 bookId, string title, string author, string isbn, string doi, string ano, string uri);

//     constructor(address defaultAdmin, address pauser, address minter)
//         ERC1155("https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/")
//     {
//         _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
//         _grantRole(PAUSER_ROLE, pauser);
//         _grantRole(MINTER_ROLE, minter);
//     }

//     // Registrar uma biblioteca (apenas admin)
//     function registerLibrary(address libraryAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
//         require(!isLibrary[libraryAddress], "Address is already a library");
//         isLibrary[libraryAddress] = true;
//         _grantRole(LIBRARY_ROLE, libraryAddress);
//         emit LibraryRegistered(libraryAddress);
//     }

//     // Definir URI base (Pinata) para compatibilidade com ERC-1155
//     function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
//         _setURI(newuri);
//     }

//     // Pausar contrato
//     function pause() public onlyRole(PAUSER_ROLE) {
//         _pause();
//     }

//     // Despausar contrato
//     function unpause() public onlyRole(PAUSER_ROLE) {
//         _unpause();
//     }

//     // Criar novo livro (token) com metadados
//     function mint(
//         address account,
//         uint256 id,
//         uint256 amount,
//         string memory title,
//         string memory author,
//         string memory isbn,
//         string memory doi,
//         string memory ano,
//         string memory uri,
//         bytes memory data
//     ) public onlyRole(MINTER_ROLE) {
//         require(isLibrary[account], "Recipient must be a library");
//         require(bytes(books[id].title).length == 0, "Book ID already exists");
//         books[id] = Book({
//             title: title,
//             author: author,
//             isbn: isbn,
//             doi: doi,
//             ano: ano,
//             uri: uri
//         });
//         _mint(account, id, amount, data);
//         emit BookCreated(id, title, author, isbn, doi, ano, uri);
//     }

//     // Criar múltiplos livros com metadados
//     function mintBatch(
//         address to,
//         uint256[] memory ids,
//         uint256[] memory amounts,
//         Book[] memory bookData,
//         bytes memory data
//     ) public onlyRole(MINTER_ROLE) {
//         require(isLibrary[to], "Recipient must be a library");
//         require(ids.length == bookData.length, "Mismatched input arrays");
//         for (uint256 i = 0; i < ids.length; i++) {
//             require(bytes(books[ids[i]].title).length == 0, "Book ID already exists");
//             books[ids[i]] = bookData[i];
//             emit BookCreated(
//                 ids[i],
//                 bookData[i].title,
//                 bookData[i].author,
//                 bookData[i].isbn,
//                 bookData[i].doi,
//                 bookData[i].ano,
//                 bookData[i].uri
//             );
//         }
//         _mintBatch(to, ids, amounts, data);
//     }

//     // Recuperar metadados de um livro
//     function getBook(uint256 bookId) public view returns (Book memory) {
//         require(bytes(books[bookId].title).length > 0, "Book does not exist");
//         return books[bookId];
//     }

//     // Requisitar empréstimo
//     function requestLoan(address libraryFrom, uint256 bookId, uint256 amount)
//         public
//         onlyRole(USER_ROLE)
//         returns (uint256)
//     {
//         require(isLibrary[libraryFrom], "Not a valid library");
//         require(balanceOf(libraryFrom, bookId) >= amount, "Library does not have enough books");
//         require(bytes(books[bookId].title).length > 0, "Book does not exist");
//         uint256 loanId = nextLoanId++;
//         loanRequests[loanId] = LoanRequest({
//             user: msg.sender,
//             libraryFrom: libraryFrom,
//             bookId: bookId,
//             amount: amount,
//             status: LoanStatus.PENDING
//         });
//         emit LoanRequested(loanId, msg.sender, libraryFrom, bookId, amount);
//         return loanId;
//     }

//     // Aprovar empréstimo
//     function approveLoan(uint256 loanId) public onlyRole(LIBRARY_ROLE) {
//         LoanRequest storage loan = loanRequests[loanId];
//         require(loan.libraryFrom == msg.sender, "Only the requested library can approve");
//         require(loan.status == LoanStatus.PENDING, "Loan is not pending");
//         require(balanceOf(msg.sender, loan.bookId) >= loan.amount, "Not enough books in library");
//         loan.status = LoanStatus.APPROVED;
//         emit LoanApproved(loanId, msg.sender);
//     }

//     // Devolver empréstimo
//     function returnLoan(uint256 loanId) public onlyRole(USER_ROLE) {
//         LoanRequest storage loan = loanRequests[loanId];
//         require(loan.user == msg.sender, "Only the borrower can return");
//         require(loan.status == LoanStatus.APPROVED, "Loan is not approved");
//         loan.status = LoanStatus.RETURNED;
//         emit LoanReturned(loanId, loan.libraryFrom);
//     }

//     // Transferência entre bibliotecas
//     function transferBetweenLibraries(address from, address to, uint256 id, uint256 amount, bytes memory data)
//         public
//         onlyRole(LIBRARY_ROLE)
//     {
//         require(isLibrary[from] && isLibrary[to], "Both addresses must be libraries");
//         require(bytes(books[id].title).length > 0, "Book does not exist");
//         safeTransferFrom(from, to, id, amount, data);
//     }

//     // Restringir transferências apenas entre bibliotecas
//     function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
//         internal
//         override(ERC1155, ERC1155Pausable, ERC1155Supply)
//     {
//         if (from != address(0) && to != address(0)) { // Ignorar mint/burn
//             require(isLibrary[from] && isLibrary[to], "Transfers only allowed between libraries");
//             for (uint256 i = 0; i < ids.length; i++) {
//                 require(bytes(books[ids[i]].title).length > 0, "Book does not exist");
//             }
//         }
//         super._update(from, to, ids, values);
//     }

//     // Suporte a interfaces
//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         override(ERC1155, AccessControl)
//         returns (bool)
//     {
//         return super.supportsInterface(interfaceId);
//     }
// }