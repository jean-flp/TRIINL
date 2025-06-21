const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TRIINL", function () {
  let TRIINL;
  let triinl;
  let deployer; // DEFAULT_ADMIN_ROLE
  let library1; // LIBRARY_ROLE
  let library2; // LIBRARY_ROLE
  let user1; // USER_ROLE
  let user2; // USER_ROLE
  let other; // Sem role especifico


  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const LIBRARY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LIBRARY_ROLE"));
  const USER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("USER_ROLE"));

  beforeEach(async function () {
    [deployer, library1, library2, user1, user2, other] = await ethers.getSigners();

    TRIINL = await ethers.getContractFactory("TRIINL");
    triinl = await TRIINL.deploy(deployer.address);
    await triinl.waitForDeployment();

    await triinl.connect(deployer).registerLibrary(library1.address, "Library One", "LIB1");
    await triinl.connect(deployer).registerLibrary(library2.address, "Library Two", "LIB2");

    await triinl.connect(user1).selfRegisterAsUser();
    await triinl.connect(user2).selfRegisterAsUser();
  });

  // --- Testes de Controle de Acesso e Roles ---
  describe("Access Control and Roles", function () {
    it("Should set the deployer as DEFAULT_ADMIN_ROLE", async function () {
      expect(await triinl.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("Should set the deployer as LIBRARY_ROLE initially", async function () {
      expect(await triinl.hasRole(LIBRARY_ROLE, deployer.address)).to.be.true;
    });

    it("Should allow users to self-register as USER_ROLE", async function () {
      expect(await triinl.hasRole(USER_ROLE, user1.address)).to.be.true;
      expect(await triinl.hasRole(USER_ROLE, user2.address)).to.be.true;
    });

    it("Should prevent self-registering as user if already has USER_ROLE", async function () {
      await expect(triinl.connect(user1).selfRegisterAsUser())
        .to.be.revertedWith("Already has USER_ROLE");
    });

    it("Should prevent non-admins from registering libraries", async function () {
      await expect(triinl.connect(other).registerLibrary(other.address, "Invalid Lib", "INV"))
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });
  });

  // --- Testes de Registro de Biblioteca ---
  describe("Library Registration", function () {
    it("Should allow DEFAULT_ADMIN_ROLE to register a new library", async function () {
      const newLibraryAddress = other.address;
      const newLibraryName = "New Public Library";
      const newLibrarySigla = "NPL";

      await expect(triinl.connect(deployer).registerLibrary(newLibraryAddress, newLibraryName, newLibrarySigla))
        .to.emit(triinl, "LibraryRegistered")
        .withArgs(newLibraryAddress, newLibrarySigla);

      const [name, sigla, isActive] = await triinl.getLibrary(newLibraryAddress);
      expect(name).to.equal(newLibraryName);
      expect(sigla).to.equal(newLibrarySigla);
      expect(isActive).to.be.true;
      expect(await triinl.hasRole(LIBRARY_ROLE, newLibraryAddress)).to.be.true;
    });

    it("Should revert if trying to register an existing library", async function () {
      await expect(triinl.connect(deployer).registerLibrary(library1.address, "Lib One", "L1"))
        .to.be.revertedWith("Library exists");
    });

    it("Should revert if registering library with empty name or sigla", async function () {
      await expect(triinl.connect(deployer).registerLibrary(other.address, "", "NPL"))
        .to.be.revertedWith("Invalid input");
      await expect(triinl.connect(deployer).registerLibrary(other.address, "New Lib", ""))
        .to.be.revertedWith("Invalid input");
    });

    it("Should get library details correctly", async function () {
      const [name, sigla, isActive] = await triinl.getLibrary(library1.address);
      expect(name).to.equal("Library One");
      expect(sigla).to.equal("LIB1");
      expect(isActive).to.be.true;
    });

    it("Should revert when trying to get a non-existent library", async function () {
      await expect(triinl.getLibrary(other.address))
        .to.be.revertedWith("Library does not exist");
    });
  });

  // --- Testes de Pausar e Despausar ---
  describe("Pause and Unpause", function () {
    it("Should allow DEFAULT_ADMIN_ROLE to pause the contract", async function () {
      await expect(triinl.connect(deployer).pause()).to.not.be.reverted;
      expect(await triinl.paused()).to.be.true;
    });

    it("Should allow DEFAULT_ADMIN_ROLE to unpause the contract", async function () {
      await triinl.connect(deployer).pause();
      await expect(triinl.connect(deployer).unpause()).to.not.be.reverted;
      expect(await triinl.paused()).to.be.false;
    });

    it("Should prevent non-admins from pausing the contract", async function () {
      await expect(triinl.connect(library1).pause())
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent non-admins from unpausing the contract", async function () {
      await triinl.connect(deployer).pause();
      await expect(triinl.connect(library1).unpause())
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });
  });

  // --- Testes de Criação de Livro (Mint) ---

describe("Book Minting", function () {
  const bookData = {
    amount: 5,
    title: "The Great Novel",
    author: "Jane Doe",
    isbn: "978-0321765723",
    doi: "10.1000/xyz123",
    ano: "2023",
    uriSuffix: "greatnovel.json"
  };

  it("Should allow a LIBRARY_ROLE to mint a new book", async function () {
    await expect(triinl.connect(library1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    ))
      .to.emit(triinl, "BookCreated")
      .withArgs(
        0,
        bookData.title,
        `https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/${bookData.uriSuffix}`
      );

    expect(await triinl.balanceOf(library1.address, 0)).to.equal(bookData.amount);
    const book = await triinl.books(0);
    expect(book.title).to.equal(bookData.title);
    expect(book.author).to.equal(bookData.author);
    expect(book.doi).to.equal(bookData.doi);
    expect(book.instituicao).to.equal(library1.address);
  });

  it("Should increment nextBookId after minting", async function () {
    await triinl.connect(library1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    );
    expect(await triinl.nextBookId()).to.equal(1);
  });

  it("Should revert if a non-library tries to mint a book", async function () {
    await expect(triinl.connect(user1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    ))
      .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
  });

  it("Should revert if an inactive library tries to mint a book", async function () {
    await triinl.connect(deployer).deactivateLibrary(library1.address);

    await expect(triinl.connect(library1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    ))
      .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
  });

  it("Should revert if trying to mint a book with existing DOI for the same institution", async function () {
    await triinl.connect(library1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    );

    await expect(triinl.connect(library1).mint(
      1,
      "Another Title",
      "Another Author",
      "123-456",
      bookData.doi,
      "2024",
      "another.json"
    ))
      .to.be.revertedWith("Book with this DOI already exists for this institution");
  });

  it("Should allow minting a book with the same DOI for a different institution", async function () {
    await triinl.connect(library1).mint(
      bookData.amount,
      bookData.title,
      bookData.author,
      bookData.isbn,
      bookData.doi,
      bookData.ano,
      bookData.uriSuffix
    );

    await expect(triinl.connect(library2).mint(
      bookData.amount,
      "Another Title by Lib2",
      "Another Author by Lib2",
      "123-456-L2",
      bookData.doi,
      "2024",
      "another-lib2.json"
    ))
      .to.not.be.reverted;

    expect(await triinl.balanceOf(library2.address, 1)).to.equal(bookData.amount);
  });

  it("Should revert if book data is invalid (empty strings)", async function () {
    await expect(triinl.connect(library1).mint(
      bookData.amount, "", bookData.author, bookData.isbn, bookData.doi, bookData.ano, bookData.uriSuffix
    )).to.be.revertedWith("Invalid book data");

    await expect(triinl.connect(library1).mint(
      bookData.amount, bookData.title, "", bookData.isbn, bookData.doi, bookData.ano, bookData.uriSuffix
    )).to.be.revertedWith("Invalid book data");

    await expect(triinl.connect(library1).mint(
      bookData.amount, bookData.title, bookData.author, "", bookData.doi, bookData.ano, bookData.uriSuffix
    )).to.be.revertedWith("Invalid book data");

    await expect(triinl.connect(library1).mint(
      bookData.amount, bookData.title, bookData.author, bookData.isbn, "", bookData.ano, bookData.uriSuffix
    )).to.be.revertedWith("Invalid book data");

    await expect(triinl.connect(library1).mint(
      bookData.amount, bookData.title, bookData.author, bookData.isbn, bookData.doi, "", bookData.uriSuffix
    )).to.be.revertedWith("Invalid book data");

    await expect(triinl.connect(library1).mint(
      bookData.amount, bookData.title, bookData.author, bookData.isbn, bookData.doi, bookData.ano, ""
    )).to.be.revertedWith("Invalid book data");
  });
});

  // --- Testes de Restock de Livro ---
  describe("Book Restock", function () {
    let bookId;
    const initialAmount = 5;
    const restockAmount = 3;

    beforeEach(async function () {
      const bookData = {
        amount: initialAmount,
        title: "Test Book",
        author: "Author A",
        isbn: "111",
        doi: "DOI-TEST-1",
        ano: "2020",
        uriSuffix: "test.json"
      };
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;
    });

    it("Should allow a LIBRARY_ROLE to restock an existing book they own", async function () {
      await expect(triinl.connect(library1).mintRestock(restockAmount, bookId))
        .to.emit(triinl, "BookRestock")
        .withArgs(bookId, library1.address, restockAmount);

      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmount + restockAmount);
    });

    it("Should prevent a LIBRARY_ROLE from restock a book they don't own", async function () {
      await expect(triinl.connect(library2).mintRestock(restockAmount, bookId))
        .to.be.revertedWith("Book institution is different from sender");
    });

    it("Should prevent a non-library from restock a book", async function () {
      await expect(triinl.connect(user1).mintRestock(restockAmount, bookId))
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });
  });

  // --- Testes de Obter Livro ---
  describe("Get Book", function () {
    let bookId;
    const bookData = {
      amount: 5,
      title: "The Great Novel",
      author: "Jane Doe",
      isbn: "978-0321765723",
      doi: "10.1000/xyz123",
      ano: "2023",
      uriSuffix: "greatnovel.json"
    };

    beforeEach(async function () {
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;
    });

    it("Should return the correct book details for an existing book", async function () {
      const book = await triinl.getBook(bookId);
      expect(book.title).to.equal(bookData.title);
      expect(book.author).to.equal(bookData.author);
      expect(book.isbn).to.equal(bookData.isbn);
      expect(book.doi).to.equal(bookData.doi);
      expect(book.ano).to.equal(bookData.ano);
      expect(book.uri).to.equal(`https://chocolate-bizarre-silverfish-712.mypinata.cloud/ipfs/${bookData.uriSuffix}`);
      expect(book.instituicao).to.equal(library1.address);
    });

    it("Should revert if trying to get a non-existent book", async function () {
      await expect(triinl.getBook(999)).to.be.revertedWith("Book does not exist");
    });
  });

  // --- Testes de Solicitação de Empréstimo ---
  describe("Loan Request", function () {
    let bookId;
    const initialAmount = 10;
    const loanAmount = 3;

    beforeEach(async function () {
      const bookData = {
        amount: initialAmount,
        title: "Sample Book",
        author: "Author B",
        isbn: "222",
        doi: "DOI-SAMPLE-2",
        ano: "2021",
        uriSuffix: "sample.json"
      };
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;
    });

    it("Should allow a USER_ROLE to request a loan", async function () {
      const loanId = await triinl.connect(user1).requestLoan.staticCall(library1.address, bookId, loanAmount);
      await expect(triinl.connect(user1).requestLoan(library1.address, bookId, loanAmount))
        .to.emit(triinl, "LoanRequested")
        .withArgs(loanId, user1.address, library1.address, bookId);

      const loanRequest = await triinl.loanRequests(loanId);
      expect(loanRequest.user).to.equal(user1.address);
      expect(loanRequest.libraryFrom).to.equal(library1.address);
      expect(loanRequest.bookId).to.equal(bookId);
      expect(loanRequest.amount).to.equal(loanAmount);
      expect(loanRequest.status).to.equal(0);
      expect(await triinl.nextLoanId()).to.equal(loanId + 1n);
    });

    it("Should revert if a non-user tries to request a loan", async function () {
      await expect(triinl.connect(other).requestLoan(library1.address, bookId, loanAmount))
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if requesting from an invalid library or non-existent book", async function () {
      await expect(triinl.connect(user1).requestLoan(other.address, bookId, loanAmount))
        .to.be.revertedWith("Invalid library or book");
      await expect(triinl.connect(user1).requestLoan(library1.address, 999, loanAmount))
        .to.be.revertedWith("Invalid library or book");
    });

    it("Should revert if requesting more books than available in the library", async function () {
      await expect(triinl.connect(user1).requestLoan(library1.address, bookId, initialAmount + 1))
        .to.be.revertedWith("Insufficient books");
    });
  });

  // --- Testes de Aprovação de Empréstimo ---
  describe("Approve Loan", function () {
    let bookId;
    let loanId;
    const initialAmount = 10;
    const loanAmount = 3;

    beforeEach(async function () {
      const bookData = {
        amount: initialAmount,
        title: "Loanable Book",
        author: "Author C",
        isbn: "333",
        doi: "DOI-LOAN-3",
        ano: "2022",
        uriSuffix: "loanable.json"
      };
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;
      await triinl.connect(user1).requestLoan(library1.address, bookId, loanAmount);
      loanId = 0;
    });

    it("Should allow a LIBRARY_ROLE to approve a pending loan request", async function () {
      await expect(triinl.connect(library1).approveLoan(loanId))
        .to.emit(triinl, "LoanApproved")
        .withArgs(loanId, library1.address);

      const loanRequest = await triinl.loanRequests(loanId);
      expect(loanRequest.status).to.equal(1);
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmount - loanAmount);
    });

    it("Should revert if a non-library tries to approve a loan", async function () {
      await expect(triinl.connect(user1).approveLoan(loanId))
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if the loan is not for the calling library", async function () {
      await expect(triinl.connect(library2).approveLoan(loanId))
        .to.be.revertedWith("Invalid approval");
    });

    it("Should revert if trying to approve an already approved loan", async function () {
      await triinl.connect(library1).approveLoan(loanId);
      await expect(triinl.connect(library1).approveLoan(loanId))
        .to.be.revertedWith("Invalid approval");
    });

    it("Should revert if trying to approve a returned loan", async function () {
      await triinl.connect(library1).approveLoan(loanId);
      await triinl.connect(user1).returnLoan(loanId);
      await expect(triinl.connect(library1).approveLoan(loanId))
        .to.be.revertedWith("Invalid approval");
    });

    it("Should revert if library has insufficient books during approval (already burnt)", async function () {
      await triinl.connect(library1).burn(library1.address, bookId, initialAmount - loanAmount + 1);
      await expect(triinl.connect(library1).approveLoan(loanId))
        .to.be.revertedWith("Insufficient books");
    });
  });

  // --- Testes de Devolução de Empréstimo ---
  describe("Return Loan", function () {
    let bookId;
    let loanId;
    const initialAmount = 10;
    const loanAmount = 3;

    beforeEach(async function () {
      const bookData = {
        amount: initialAmount,
        title: "Returnable Book",
        author: "Author D",
        isbn: "444",
        doi: "DOI-RETURN-4",
        ano: "2023",
        uriSuffix: "returnable.json"
      };
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;

      await triinl.connect(user1).requestLoan(library1.address, bookId, loanAmount);
      loanId = 0;
      await triinl.connect(library1).approveLoan(loanId);
    });

    it("Should allow a USER_ROLE to return an approved loan", async function () {
      await expect(triinl.connect(user1).returnLoan(loanId))
        .to.emit(triinl, "LoanReturned")
        .withArgs(loanId, library1.address);

      const loanRequest = await triinl.loanRequests(loanId);
      expect(loanRequest.status).to.equal(2);
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmount);
    });

    it("Should revert if a non-user tries to return a loan", async function () {
      await expect(triinl.connect(library1).returnLoan(loanId))
        .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
    });

    it("Should revert if a different user tries to return someone else's loan", async function () {
      await expect(triinl.connect(user2).returnLoan(loanId))
        .to.be.revertedWith("Invalid return");
    });

    it("Should revert if trying to return a pending loan", async function () {
      const bookData2 = {
        amount: 5,
        title: "Pending Book", author: "A", isbn: "555", doi: "DOI-PENDING-5", ano: "2024", uriSuffix: "pending.json"
      };
      await triinl.connect(library1).mint(
        bookData2.amount, bookData2.title, bookData2.author, bookData2.isbn, bookData2.doi, bookData2.ano, bookData2.uriSuffix
      );
      const pendingLoanId = await triinl.connect(user1).requestLoan.staticCall(library1.address, 1, 1);
      await triinl.connect(user1).requestLoan(library1.address, 1, 1);

      await expect(triinl.connect(user1).returnLoan(pendingLoanId))
        .to.be.revertedWith("Invalid return");
    });

    it("Should revert if trying to return an already returned loan", async function () {
      await triinl.connect(user1).returnLoan(loanId);
      await expect(triinl.connect(user1).returnLoan(loanId))
        .to.be.revertedWith("Invalid return");
    });
  });

  // --- Testes de Transferência entre Bibliotecas ---
describe("Transfer Between Libraries", function () {
  let bookId;
  const initialAmountLib1 = 10;
  const transferAmount = 3;

  beforeEach(async function () {
    const bookDataLib1 = {
      amount: initialAmountLib1,
      title: "Transferable Book Lib1",
      author: "Author E",
      isbn: "666",
      doi: "DOI-TRANSFER-6",
      ano: "2024",
      uriSuffix: "transfer_lib1.json"
    };
    await triinl.connect(library1).mint(
      bookDataLib1.amount,
      bookDataLib1.title,
      bookDataLib1.author,
      bookDataLib1.isbn,
      bookDataLib1.doi,
      bookDataLib1.ano,
      bookDataLib1.uriSuffix
    );
    bookId = 0;

    const bookDataLib2 = {
      amount: 5,
      title: "Another Book Lib2",
      author: "Author F",
      isbn: "777",
      doi: "DOI-ANOTHER-7",
      ano: "2024",
      uriSuffix: "another_lib2.json"
    };
    await triinl.connect(library2).mint(
      bookDataLib2.amount,
      bookDataLib2.title,
      bookDataLib2.author,
      bookDataLib2.isbn,
      bookDataLib2.doi,
      bookDataLib2.ano,
      bookDataLib2.uriSuffix
    );
  });

  it("Should allow a LIBRARY_ROLE to transfer books between active libraries", async function () {
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(library1).transferBetweenLibraries(library1.address, library2.address, bookId, transferAmount, data))
      .to.not.be.reverted;

    expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmountLib1 - transferAmount);
    expect(await triinl.balanceOf(library2.address, bookId)).to.equal(transferAmount);
  });

  it("Should revert if a non-library tries to transfer books", async function () {
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(user1).transferBetweenLibraries(library1.address, library2.address, bookId, transferAmount, data))
      .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
  });

  it("Should revert if 'from' library is inactive", async function () {
    await triinl.connect(deployer).deactivateLibrary(library1.address);
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(library1).transferBetweenLibraries(library1.address, library2.address, bookId, transferAmount, data))
      .to.be.revertedWithCustomError(triinl, "AccessControlUnauthorizedAccount");
  });


  it("Should revert if 'to' library is inactive", async function () {
    await triinl.connect(deployer).deactivateLibrary(library2.address);
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(library1).transferBetweenLibraries(library1.address, library2.address, bookId, transferAmount, data))
      .to.be.revertedWith("Invalid transfer"); 
  });

  it("Should revert if book does not exist", async function () {
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(library1).transferBetweenLibraries(library1.address, library2.address, 999, transferAmount, data))
      .to.be.revertedWith("Invalid transfer");
  });

it("Should revert if sender is not the 'from' account", async function () {
    const data = ethers.toUtf8Bytes("transfer");
    await expect(triinl.connect(library2).transferBetweenLibraries(library1.address, library2.address, bookId, transferAmount, data))
        .to.be.revertedWithCustomError(triinl, "ERC1155MissingApprovalForAll")
        .withArgs(library2.address, library1.address);
});
});

  // --- Testes de Função `_update` ---
  describe("_update function overrides", function () {
    let bookId;
    const initialAmount = 10;
    const transferAmount = 3;

    beforeEach(async function () {
      const bookData = {
        amount: initialAmount,
        title: "Update Test Book",
        author: "Author U",
        isbn: "888",
        doi: "DOI-UPDATE-8",
        ano: "2025",
        uriSuffix: "update.json"
      };
      await triinl.connect(library1).mint(
        bookData.amount,
        bookData.title,
        bookData.author,
        bookData.isbn,
        bookData.doi,
        bookData.ano,
        bookData.uriSuffix
      );
      bookId = 0;
    });

    it("Should revert if 'from' library is inactive during internal _update (e.g., direct safeTransferFrom)", async function () {

        await triinl.connect(deployer).deactivateLibrary(library1.address);


        await expect(triinl.connect(library1).safeTransferFrom(library1.address, library2.address, bookId, transferAmount, ethers.toUtf8Bytes("")))
            .to.be.revertedWith("Invalid libraries");
    });
    it("Should revert if 'to' library is inactive during internal _update", async function () {
        await triinl.connect(deployer).deactivateLibrary(library2.address);

        await expect(triinl.connect(library1).safeTransferFrom(library1.address, library2.address, bookId, transferAmount, ethers.toUtf8Bytes("")))
            .to.be.revertedWith("Invalid libraries");
    });

    it("Should revert if book does not exist during internal _update", async function () {
      await expect(triinl.connect(library1).safeTransferFrom(library1.address, library2.address, 999, transferAmount, ethers.toUtf8Bytes("")))
        .to.be.revertedWith("Book does not exist");
    });

    it("Should allow transfer to address zero (burn) from active library", async function () {
      await expect(triinl.connect(library1).burn(library1.address, bookId, transferAmount))
        .to.not.be.reverted;
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmount - transferAmount);
    });

    it("Should allow transfer from address zero (mint) to active library", async function () {
      const mintAmount = 2;
      await triinl.connect(library1).mintRestock(mintAmount, bookId);
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(initialAmount + mintAmount);
    });
  });

  // --- Testes de Suporte a Interfaces ---
  describe("Interface Support", function () {
    it("Should support ERC1155 interface", async function () {
      const ERC1155_INTERFACE_ID = "0xd9b67a26";
      expect(await triinl.supportsInterface(ERC1155_INTERFACE_ID)).to.be.true;
    });

    it("Should not support a random interface", async function () {
      const RANDOM_INTERFACE_ID = "0x12345678";
      expect(await triinl.supportsInterface(RANDOM_INTERFACE_ID)).to.be.false;
    });
  });
});