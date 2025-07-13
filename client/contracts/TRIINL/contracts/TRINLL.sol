// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract TRIINL is
    ERC1155,
    AccessControl,
    ERC1155Pausable,
    ERC1155Burnable,
    ERC1155Supply
{
    bytes32 public constant LIBRARY_ROLE = keccak256("LIBRARY_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    struct Book {
        string title;
        string author;
        string isbn;
        string ano;
        string uri;
        address instituicao;
    }

    struct Library {
        string name;
        string sigla;
        string enderecoEmail;
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
    address[] public registeredLibraryAddresses;
    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(address => string) public userEmails;
    uint256 public nextLoanId;
    uint256 public nextBookId;

    event LoanRequested(
        uint256 loanId,
        address user,
        address libraryFrom,
        uint256 bookId
    );
    event LoanApproved(uint256 loanId, address libraryFrom);
    event LoanReturned(uint256 loanId, address libraryFrom);
    event BookCreated(uint256 bookId, string title, string uri);
    event BookRestock(uint256 bookId, address libraryFrom, uint256 amount);
    event LibraryRegistered(address libraryAddress, string sigla);
    event LibraryDeactivated(address libraryAddress);
    event UserEmailSet(address userAddress, string email);

    constructor(address defaultAdmin)
        ERC1155("http://localhost:3000/ipfs/")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(LIBRARY_ROLE, defaultAdmin);
        _setRoleAdmin(LIBRARY_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    function selfRegisterAsUser() external {
    require(!hasRole(USER_ROLE, msg.sender), "Already has USER_ROLE");
    _grantRole(USER_ROLE, msg.sender);
    }

    function setUserEmail(string memory _email) external{
        require(bytes(_email).length > 0, "Email cannot be empty");
        userEmails[msg.sender] = _email;
        emit UserEmailSet(msg.sender, _email);
    }

    function getUserEmail(address _userAddress) external view returns (string memory){
        return userEmails[_userAddress];
    }

    function registerLibrary(
        address libraryAddress,
        string memory name,
        string memory sigla,
        string memory enderecoEmail
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(libraries[libraryAddress].isActive == false, "Library already exists and is active");
        require(
            bytes(name).length > 0 && bytes(sigla).length > 0 && bytes(enderecoEmail).length > 0,
            "Invalid input: name, sigla or email cannot be empty"
        );

        bool found = false;
        for(uint i = 0; i < registeredLibraryAddresses.length; i++) {
            if (registeredLibraryAddresses[i] == libraryAddress) {
                found = true;
                break;
            }
        }
        if (!found) {
            registeredLibraryAddresses.push(libraryAddress);
        }
        
        libraries[libraryAddress] = Library(name, sigla, enderecoEmail, true);
        _grantRole(LIBRARY_ROLE, libraryAddress);
        emit LibraryRegistered(libraryAddress, sigla);
    }

    function getLibrary(address libraryAddress)
        external
        view
        returns (
            string memory name,
            string memory sigla,
            string memory enderecoEmail,
            bool isActive
        )
    {
        Library memory lib = libraries[libraryAddress];
        require(lib.isActive, "Library does not exist or is inactive");
        return (lib.name, lib.sigla, lib.enderecoEmail, lib.isActive);
    }

    function setURI(string memory newuri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setURI(newuri);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function memcmp(bytes memory a, bytes memory b)
        internal
        pure
        returns (bool)
    {
        return (a.length == b.length) && (keccak256(a) == keccak256(b));
    }

    function strcmp(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return memcmp(bytes(a), bytes(b));
    }
    function concatenate(string memory str1, string memory str2) internal  pure returns (string memory) {
        return string(abi.encodePacked(str1, str2));
    }

    function mint(
        uint256 amount,
        string memory title,
        string memory author,
        string memory isbn,
        string memory ano,
        string memory uriSuffix
    ) external onlyRole(LIBRARY_ROLE) {
        require(libraries[msg.sender].isActive, "Invalid library: sender is not an active library");
        for(uint256 i = 0; i < nextBookId; i++){
            if (strcmp(books[i].isbn, isbn) && books[i].instituicao == msg.sender) {
                revert("Book with this ISBN already exists for this institution");
            }
        }
        require(
            bytes(title).length > 0 &&
                bytes(author).length > 0 &&
                bytes(isbn).length > 0 &&
                bytes(ano).length > 0 &&
                bytes(uriSuffix).length > 0,
            "Invalid book data: all fields must be non-empty"
        );

        uint256 id = nextBookId++;

        string memory baseURI = uri(id);
        string memory fullURI = concatenate(baseURI, uriSuffix);

        books[id] = Book(
            title,
            author,
            isbn,
            ano,
            fullURI,
            msg.sender
        );
        _mint(msg.sender, id, amount, "");
        emit BookCreated(id, title, fullURI);
    }

    function mintRestock(uint256 amount,uint256 id) external onlyRole(LIBRARY_ROLE){
        require(books[id].instituicao == msg.sender,"Book institution is different from sender");//pertencimento da token ao sender
        _mint(msg.sender, id, amount, "");
        emit BookRestock(id,msg.sender,amount);
    }

    function getBook(uint256 bookId) external view returns (Book memory) {
        require(bytes(books[bookId].title).length > 0, "Book does not exist");
        return books[bookId];
    }

    function requestLoan(
        address libraryFrom,
        uint256 bookId,
        uint256 amount
    ) external onlyRole(USER_ROLE) returns (uint256) {
        require(
            libraries[libraryFrom].isActive &&
                bytes(books[bookId].title).length > 0,
            "Invalid library or book"
        );
        require(balanceOf(libraryFrom, bookId) >= amount, "Insufficient books");

        uint256 loanId = nextLoanId++;
        loanRequests[loanId] = LoanRequest(
            msg.sender,
            libraryFrom,
            bookId,
            amount,
            0
        );
        emit LoanRequested(loanId, msg.sender, libraryFrom, bookId);
        return loanId;
    }

        function approveLoan(uint256 loanId) external onlyRole(LIBRARY_ROLE) {
        require(libraries[msg.sender].isActive, "Library is not active");


        LoanRequest storage loan = loanRequests[loanId];
        require(
            loan.libraryFrom == msg.sender && loan.status == 0,
            "Invalid approval"
        );
        require(
            balanceOf(msg.sender, loan.bookId) >= loan.amount,
            "Insufficient books"
        );

        // Queima os tokens correspondentes ao empréstimo
        _burn(msg.sender, loan.bookId, loan.amount);

        // Atualiza o status do empréstimo para APPROVED
        loan.status = 1;
        emit LoanApproved(loanId, msg.sender);
    }

    function returnLoan(uint256 loanId) external onlyRole(USER_ROLE) {
        //require(loanRequests[loanId]== true); verificar depois a criação para impedir em chamadas de loan que nao existem assim user mintando
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.libraryFrom == msg.sender && loan.status == 1, "Invalid return");

        // Mintar novamente os tokens para a biblioteca
        _mint(loan.libraryFrom, loan.bookId, loan.amount, "");

        // Atualiza o status do empréstimo para RETURNED
        loan.status = 2;
        emit LoanReturned(loanId, loan.libraryFrom);
    }

    function transferBetweenLibraries(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyRole(LIBRARY_ROLE) {
        require(
            libraries[from].isActive &&
                libraries[to].isActive &&
                bytes(books[id].title).length > 0,
            "Invalid transfer"
        );
        safeTransferFrom(from, to, id, amount, data);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            require(
                libraries[from].isActive && libraries[to].isActive,
                "Invalid libraries"
            );
            for (uint256 i = 0; i < ids.length; i++) {
                require(
                    bytes(books[ids[i]].title).length > 0,
                    "Book does not exist"
                );
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

    function deactivateLibrary(address libraryAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    require(libraries[libraryAddress].isActive == true, "Library is already inactive or does not exist");
    libraries[libraryAddress].isActive = false;
    _revokeRole(LIBRARY_ROLE, libraryAddress);
    emit LibraryDeactivated(libraryAddress);
    }

    function getAllRegisteredLibraryAddresses() public view returns (address[] memory) {
        return registeredLibraryAddresses;
    }
}