// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LibraryNFT is ERC721, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    struct BookMetadata {
        string title;
        string author;
        string ISBN;
        string DOI;
        string ANO;
        bool available;
    }

    struct Institution {
        string name;
        bool registered;
    }

    struct BookInput {
        string title;
        string author;
        string isbn;
        string doi;
        string ano;
        string uri;
    }

    mapping(uint256 => BookMetadata) public bookInfo;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => Institution) public institutions;

    modifier onlyRegistered() {
        require(institutions[msg.sender].registered, "Instituicao nao registrada");
        _;
    }

    constructor(address initialOwner)
        ERC721("LibraryBook", "LBK")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs:/biblioteca/";
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function registerInstitution(string calldata name) external {
        institutions[msg.sender] = Institution(name, true);
    }

    function mintBook(
        address to,
        BookInput calldata input
    ) external onlyRegistered returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = input.uri;
        bookInfo[tokenId] = BookMetadata(input.title, input.author, input.isbn, input.doi, input.ano, true);
        return tokenId;
    }

    function lendBook(uint256 tokenId, address toInstitution) external {
        require(ownerOf(tokenId) == msg.sender, "Voce nao possui este livro");
        require(institutions[toInstitution].registered, "Instituicao destino nao registrada");
        require(bookInfo[tokenId].available, "Livro nao disponivel");

        bookInfo[tokenId].available = false;
        _safeTransfer(msg.sender, toInstitution, tokenId, "");
    }

    function returnBook(uint256 tokenId) external {
        require(_exists(tokenId), "Livro nao existe");
        require(institutions[msg.sender].registered, "Somente instituicoes podem devolver");
        require(ownerOf(tokenId) == msg.sender, "Voce nao possui este livro");

        bookInfo[tokenId].available = true;
    }

    function getBookMetadata(uint256 tokenId) external view returns (BookMetadata memory) {
        require(_exists(tokenId), "Livro nao existe");
        return bookInfo[tokenId];
    }

    function getBookOwnerAndURI(uint256 tokenId) external view returns (
        address owner,
        string memory uri
    ) {
        require(_exists(tokenId), "Livro nao existe");

        return (ownerOf(tokenId), _tokenURIs[tokenId]);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");

        string memory base = _baseURI();
        string memory uri = _tokenURIs[tokenId];

        return bytes(base).length > 0 ? string(abi.encodePacked(base, uri)) : uri;
    }
}