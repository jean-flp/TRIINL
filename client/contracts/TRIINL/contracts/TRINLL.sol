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

    struct Library {
        string name;
        string sigla;
        bool isActive;
    }

    struct LoanRequest {
        address user;
        address libraryFrom;
        uint256 bookId;
        uint256 amount;
        uint8 status; // 0: PENDING, 1: APPROVED, 2: RETURNED
    }

    mapping(uint256 => Book) public books;
    mapping(address => Library) public libraries;
    mapping(uint256 => LoanRequest) public loanRequests;
    uint256 public nextLoanId;

    event LoanRequested(uint256 loanId, address user, address libraryFrom, uint256 bookId);
    event LoanApproved(uint256 loanId, address libraryFrom);
    event LoanReturned(uint256 loanId, address libraryFrom);
    event BookCreated(uint256 bookId, string title, string uri);
    event LibraryRegistered(address libraryAddress, string sigla);

    constructor(address defaultAdmin)
        ERC1155("https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(LIBRARY_ROLE, defaultAdmin);
        _setRoleAdmin(LIBRARY_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    function registerLibrary(address libraryAddress, string memory name, string memory sigla)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(libraries[libraryAddress].isActive == false, "Library exists");
        require(bytes(name).length > 0 && bytes(sigla).length > 0, "Invalid input");
        
        libraries[libraryAddress] = Library(name, sigla, true);
        _grantRole(LIBRARY_ROLE, libraryAddress);
        emit LibraryRegistered(libraryAddress, sigla);
    }

    function getLibrary(address libraryAddress)
        external
        view
        returns (string memory name, string memory sigla, bool isActive)
    {
        Library memory lib = libraries[libraryAddress];
        require(lib.isActive, "Library does not exist");
        return (lib.name, lib.sigla, lib.isActive);
    }

    function setURI(string memory newuri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setURI(newuri);
    }

    function pause()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _pause();
    }

    function unpause()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _unpause();
    }

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
    )
        external
        onlyRole(LIBRARY_ROLE)
    {
        require(libraries[account].isActive && bytes(books[id].title).length == 0, "Invalid library or book exists");
        require(bytes(title).length > 0 && bytes(author).length > 0, "Invalid book data");

        books[id] = Book(title, author, isbn, doi, ano, uri);
        _mint(account, id, amount, "0x");
        emit BookCreated(id, title, uri);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        Book[] memory bookData
    )
        external
        onlyRole(LIBRARY_ROLE)
    {
        require(libraries[to].isActive, "Invalid library");
        require(ids.length == bookData.length && ids.length == amounts.length, "Mismatched arrays");

        for (uint256 i = 0; i < ids.length; i++) {
            require(bytes(books[ids[i]].title).length == 0 && bytes(bookData[i].title).length > 0 && bytes(bookData[i].author).length > 0, "Invalid book data");
            books[ids[i]] = bookData[i];
            emit BookCreated(ids[i], bookData[i].title, bookData[i].uri);
        }
        _mintBatch(to, ids, amounts, "0x");
    }

    function getBook(uint256 bookId)
        external
        view
        returns (Book memory)
    {
        require(bytes(books[bookId].title).length > 0, "Book does not exist");
        return books[bookId];
    }

    function requestLoan(address libraryFrom, uint256 bookId, uint256 amount)
        external
        onlyRole(USER_ROLE)
        returns (uint256)
    {
        require(libraries[libraryFrom].isActive && bytes(books[bookId].title).length > 0, "Invalid library or book");
        require(balanceOf(libraryFrom, bookId) >= amount, "Insufficient books");

        uint256 loanId = nextLoanId++;
        loanRequests[loanId] = LoanRequest(msg.sender, libraryFrom, bookId, amount, 0);
        emit LoanRequested(loanId, msg.sender, libraryFrom, bookId);
        return loanId;
    }

    function approveLoan(uint256 loanId)
        external
        onlyRole(LIBRARY_ROLE)
    {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.libraryFrom == msg.sender && loan.status == 0, "Invalid approval");
        require(balanceOf(msg.sender, loan.bookId) >= loan.amount, "Insufficient books");

        loan.status = 1;
        emit LoanApproved(loanId, msg.sender);
    }

    function returnLoan(uint256 loanId)
        external
        onlyRole(USER_ROLE)
    {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.user == msg.sender && loan.status == 1, "Invalid return");

        loan.status = 2;
        emit LoanReturned(loanId, loan.libraryFrom);
    }

    function transferBetweenLibraries(address from, address to, uint256 id, uint256 amount, bytes memory data)
        external
        onlyRole(LIBRARY_ROLE)
    {
        require(libraries[from].isActive && libraries[to].isActive && bytes(books[id].title).length > 0, "Invalid transfer");
        safeTransferFrom(from, to, id, amount, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        if (from != address(0) && to != address(0)) {
            require(libraries[from].isActive && libraries[to].isActive, "Invalid libraries");
            for (uint256 i = 0; i < ids.length; i++) {
                require(bytes(books[ids[i]].title).length > 0, "Book does not exist");
            }
        }
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}