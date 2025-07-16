// test/TRIINL.test.js
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TRIINL Contract", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployTRIINLFixture() {
    // Get the signers
    const [admin, library1, library2, user1, user2, otherAccount] =
      await ethers.getSigners();

    // Deploy the contract
    const TRIINL = await ethers.getContractFactory("TRIINL");
    const triinl = await TRIINL.deploy(admin.address);

    // Define roles for convenience
    const LIBRARY_ROLE = await triinl.LIBRARY_ROLE();
    const USER_ROLE = await triinl.USER_ROLE();
    const DEFAULT_ADMIN_ROLE = await triinl.DEFAULT_ADMIN_ROLE();

    return {
      triinl,
      admin,
      library1,
      library2,
      user1,
      user2,
      otherAccount,
      LIBRARY_ROLE,
      USER_ROLE,
      DEFAULT_ADMIN_ROLE,
    };
  }

  // Main test suite
  describe("Deployment and Roles", function () {
    it("Should set the deployer as the default admin", async function () {
      const { triinl, admin, DEFAULT_ADMIN_ROLE } = await loadFixture(
        deployTRIINLFixture
      );
      expect(await triinl.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be
        .true;
    });

    it("Should grant the deployer the LIBRARY_ROLE initially", async function () {
      const { triinl, admin, LIBRARY_ROLE } = await loadFixture(
        deployTRIINLFixture
      );
      expect(await triinl.hasRole(LIBRARY_ROLE, admin.address)).to.be.true;
    });

    it("Should set the correct role admins", async function () {
      const { triinl, LIBRARY_ROLE, USER_ROLE, DEFAULT_ADMIN_ROLE } =
        await loadFixture(deployTRIINLFixture);
      expect(await triinl.getRoleAdmin(LIBRARY_ROLE)).to.equal(
        DEFAULT_ADMIN_ROLE
      );
      expect(await triinl.getRoleAdmin(USER_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    });

    it("Should initialize with paused state as 0", async function () {
      const { triinl } = await loadFixture(deployTRIINLFixture);
      expect(await triinl.getPaused()).to.equal(0);
    });
  });

  describe("User Management", function () {
    it("Should allow a new account to self-register as a user", async function () {
      const { triinl, user1, USER_ROLE } = await loadFixture(
        deployTRIINLFixture
      );
      await expect(triinl.connect(user1).selfRegisterAsUser("user1@test.com"))
        .to.emit(triinl, "UserEmailSet")
        .withArgs(user1.address, "user1@test.com");
      expect(await triinl.hasRole(USER_ROLE, user1.address)).to.be.true;
      expect(await triinl.getUserEmail(user1.address)).to.equal(
        "user1@test.com"
      );
    });

    it("Should prevent an existing user from registering again", async function () {
      const { triinl, user1 } = await loadFixture(deployTRIINLFixture);
      await triinl.connect(user1).selfRegisterAsUser("user1@test.com");
      await expect(
        triinl.connect(user1).selfRegisterAsUser("newemail@test.com")
      ).to.be.revertedWith("Already has USER_ROLE");
    });

    it("Should prevent registration with an empty email", async function () {
      const { triinl, user1 } = await loadFixture(deployTRIINLFixture);
      await expect(
        triinl.connect(user1).selfRegisterAsUser("")
      ).to.be.revertedWith("Email cannot be empty");
    });
  });

  describe("Library Management", function () {
    it("Should allow admin to register a new library", async function () {
      const { triinl, admin, library1, LIBRARY_ROLE } = await loadFixture(
        deployTRIINLFixture
      );
      await expect(
        triinl
          .connect(admin)
          .registerLibrary(
            library1.address,
            "Main Library",
            "MLIB",
            "lib1@test.com"
          )
      )
        .to.emit(triinl, "LibraryRegistered")
        .withArgs(library1.address, "MLIB");

      expect(await triinl.hasRole(LIBRARY_ROLE, library1.address)).to.be.true;
      const lib = await triinl.getLibrary(library1.address);
      expect(lib.name).to.equal("Main Library");
      expect(lib.isActive).to.be.true;

      const registered = await triinl.getAllRegisteredLibraryAddresses();
      expect(registered).to.include(library1.address);
    });

    it("Should fail to register a library with invalid input", async function () {
      const { triinl, admin, library1 } = await loadFixture(
        deployTRIINLFixture
      );
      await expect(
        triinl
          .connect(admin)
          .registerLibrary(library1.address, "", "MLIB", "lib1@test.com")
      ).to.be.revertedWithCustomError(triinl, "InvalidInput");
    });

    it("Should fail if a non-admin tries to register a library", async function () {
      const { triinl, otherAccount, library1 } = await loadFixture(
        deployTRIINLFixture
      );
      await expect(
        triinl
          .connect(otherAccount)
          .registerLibrary(library1.address, "Hacker Lib", "HLIB", "h@h.com")
      ).to.be.reverted;
    });

    it("Should allow admin to deactivate a library", async function () {
      const { triinl, admin, library1, LIBRARY_ROLE } = await loadFixture(
        deployTRIINLFixture
      );
      await triinl
        .connect(admin)
        .registerLibrary(
          library1.address,
          "Main Library",
          "MLIB",
          "lib1@test.com"
        );
      expect(await triinl.hasRole(LIBRARY_ROLE, library1.address)).to.be.true;

      await expect(triinl.connect(admin).deactivateLibrary(library1.address))
        .to.emit(triinl, "LibraryDeactivated")
        .withArgs(library1.address);

      expect(await triinl.hasRole(LIBRARY_ROLE, library1.address)).to.be.false;
      await expect(triinl.getLibrary(library1.address)).to.be.revertedWith(
        "Library does not exist or is inactive"
      );
    });
  });

  describe("Book Management", function () {
    let fixture;
    beforeEach(async () => {
      fixture = await loadFixture(deployTRIINLFixture);
      const { triinl, admin, library1 } = fixture;
      await triinl
        .connect(admin)
        .registerLibrary(
          library1.address,
          "Main Library",
          "MLIB",
          "lib1@test.com"
        );
    });

    it("Should allow a registered library to mint a new book", async function () {
      const { triinl, library1 } = fixture;
      await expect(
        triinl
          .connect(library1)
          .mint(
            10,
            "The Great Gatsby",
            "F. Scott Fitzgerald",
            "978-3-16-148410-0",
            "1925",
            "gatsby.json"
          )
      )
        .to.emit(triinl, "BookCreated")
        .withArgs(0, "The Great Gatsby", "gatsby.json");

      const book = await triinl.getBook(0);
      expect(book.title).to.equal("The Great Gatsby");
      expect(book.instituicao).to.equal(library1.address);
      expect(await triinl.balanceOf(library1.address, 0)).to.equal(10);
      expect(await triinl.nextBookId()).to.equal(1);
    });

    it("Should prevent minting a book with an existing ISBN for the same institution", async function () {
      const { triinl, library1 } = fixture;
      await triinl
        .connect(library1)
        .mint(
          10,
          "The Great Gatsby",
          "F. Scott Fitzgerald",
          "978-3-16-148410-0",
          "1925",
          "gatsby.json"
        );
      await expect(
        triinl
          .connect(library1)
          .mint(
            5,
            "Another Book",
            "Another Author",
            "978-3-16-148410-0",
            "2023",
            "another.json"
          )
      ).to.be.revertedWith(
        "Book with this ISBN already exists for this institution"
      );
    });

    it("Should allow a different library to mint a book with the same ISBN", async function () {
      const { triinl, admin, library1, library2 } = fixture;
      await triinl
        .connect(admin)
        .registerLibrary(
          library2.address,
          "Second Library",
          "SLIB",
          "lib2@test.com"
        );

      await triinl
        .connect(library1)
        .mint(
          10,
          "The Great Gatsby",
          "F. Scott Fitzgerald",
          "978-3-16-148410-0",
          "1925",
          "gatsby.json"
        );

      await expect(
        triinl
          .connect(library2)
          .mint(
            5,
            "El Gran Gatsby",
            "F. Scott Fitzgerald",
            "978-3-16-148410-0",
            "1925",
            "gatsby_es.json"
          )
      )
        .to.emit(triinl, "BookCreated")
        .withArgs(1, "El Gran Gatsby", "gatsby_es.json");

      const book1 = await triinl.getBook(0);
      const book2 = await triinl.getBook(1);
      expect(book1.isbn).to.equal(book2.isbn);
      expect(book1.instituicao).to.not.equal(book2.instituicao);
    });

    it("Should allow a library to restock an existing book", async function () {
      const { triinl, library1 } = fixture;
      await triinl
        .connect(library1)
        .mint(
          10,
          "Moby Dick",
          "Herman Melville",
          "978-1-5032-8078-6",
          "1851",
          "moby.json"
        ); // bookId 0

      await expect(triinl.connect(library1).mintRestock(5, 0))
        .to.emit(triinl, "BookRestock")
        .withArgs(0, library1.address, 5);

      expect(await triinl.balanceOf(library1.address, 0)).to.equal(15);
    });

    it("Should prevent a library from restocking a book it does not own", async function () {
      const { triinl, admin, library1, library2 } = fixture;
      await triinl
        .connect(admin)
        .registerLibrary(
          library2.address,
          "Second Library",
          "SLIB",
          "lib2@test.com"
        );
      await triinl
        .connect(library1)
        .mint(
          10,
          "Moby Dick",
          "Herman Melville",
          "978-1-5032-8078-6",
          "1851",
          "moby.json"
        ); // bookId 0

      await expect(
        triinl.connect(library2).mintRestock(5, 0)
      ).to.be.revertedWith("Book institution is different from sender");
    });
  });

  describe("Loan Workflow", function () {
    let fixture;
    let bookId = 0;
    let loanId = 0;

    beforeEach(async () => {
      fixture = await loadFixture(deployTRIINLFixture);
      const { triinl, admin, library1, user1 } = fixture;
      // Setup: register library, user, and mint a book
      await triinl
        .connect(admin)
        .registerLibrary(
          library1.address,
          "Main Library",
          "MLIB",
          "lib1@test.com"
        );
      await triinl.connect(user1).selfRegisterAsUser("user1@test.com");
      await triinl
        .connect(library1)
        .mint(
          10,
          "1984",
          "George Orwell",
          "978-0-452-28423-4",
          "1949",
          "1984.json"
        );
    });

    it("1. User requests a loan successfully", async function () {
      const { triinl, library1, user1 } = fixture;
      await expect(
        triinl.connect(user1).requestLoan(library1.address, bookId, 1)
      )
        .to.emit(triinl, "LoanRequested")
        .withArgs(loanId, user1.address, library1.address, bookId);
      const request = await triinl.loanRequests(loanId);
      expect(request.user).to.equal(user1.address);
      expect(request.status).to.equal(0); // Em espera
    });

    it("2. Library approves the loan", async function () {
      const { triinl, library1, user1 } = fixture;
      await triinl.connect(user1).requestLoan(library1.address, bookId, 1);

      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(10);

      await expect(triinl.connect(library1).approveLoan(loanId))
        .to.emit(triinl, "LoanApproved")
        .withArgs(loanId, library1.address);

      const request = await triinl.loanRequests(loanId);
      expect(request.status).to.equal(1); // Retirar (Approved)
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(9); // 1 token burned
    });

    it("3. Library marks the book as picked up by the user", async function () {
      const { triinl, library1, user1 } = fixture;
      await triinl.connect(user1).requestLoan(library1.address, bookId, 1);
      await triinl.connect(library1).approveLoan(loanId);

      // This emits LoanReturned, as per the contract code
      await expect(triinl.connect(library1).bookWithUser(loanId))
        .to.emit(triinl, "LoanReturned")
        .withArgs(loanId, library1.address);

      const request = await triinl.loanRequests(loanId);
      expect(request.status).to.equal(3); // Retornar (With User)
    });

    it("4. Library processes the book return", async function () {
      const { triinl, library1, user1 } = fixture;
      await triinl.connect(user1).requestLoan(library1.address, bookId, 1);
      await triinl.connect(library1).approveLoan(loanId);
      await triinl.connect(library1).bookWithUser(loanId);

      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(9);

      await expect(triinl.connect(library1).returnLoan(loanId))
        .to.emit(triinl, "LoanReturned")
        .withArgs(loanId, library1.address);

      const request = await triinl.loanRequests(loanId);
      expect(request.status).to.equal(2); // Entregue (Returned)
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(10); // Token minted back
    });

    it("Should allow a library to reject a loan", async function () {
      const { triinl, library1, user1 } = fixture;
      await triinl.connect(user1).requestLoan(library1.address, bookId, 1);

      await expect(triinl.connect(library1).rejectLoan(loanId)).to.emit(
        triinl,
        "LoanReturned"
      ); // Event name is a bit confusing but matches contract

      const request = await triinl.loanRequests(loanId);
      expect(request.status).to.equal(4); // Rejeitado
      expect(await triinl.balanceOf(library1.address, bookId)).to.equal(10); // Balance unchanged
    });

    it("Should prevent loan request for more books than available", async function () {
      const { triinl, library1, user1 } = fixture;
      await expect(
        triinl.connect(user1).requestLoan(library1.address, bookId, 11)
      ).to.be.revertedWith("Insufficient books");
    });

    it("Should prevent another library from approving a loan", async function () {
      const { triinl, admin, library1, library2, user1 } = fixture;
      await triinl
        .connect(admin)
        .registerLibrary(library2.address, "Second Lib", "SLIB", "s@s.com");
      await triinl.connect(user1).requestLoan(library1.address, bookId, 1);

      await expect(
        triinl.connect(library2).approveLoan(loanId)
      ).to.be.revertedWith("Invalid approval");
    });
  });

  describe("Pausable Functionality", function () {
    let fixture;
    beforeEach(async () => {
      fixture = await loadFixture(deployTRIINLFixture);
      const { triinl, admin, library1 } = fixture;
      await triinl
        .connect(admin)
        .registerLibrary(
          library1.address,
          "Main Library",
          "MLIB",
          "lib1@test.com"
        );
    });

    it("Should allow admin to pause and unpause the contract", async function () {
      const { triinl, admin } = fixture;
      await triinl.connect(admin).pause();
      expect(await triinl.paused()).to.be.true;
      expect(await triinl.getPaused()).to.equal(1);

      await triinl.connect(admin).unpause();
      expect(await triinl.paused()).to.be.false;
      expect(await triinl.getPaused()).to.equal(0);
    });

    it("Should fail if a non-admin tries to pause or unpause", async function () {
      const { triinl, otherAccount } = fixture;
      await expect(triinl.connect(otherAccount).pause()).to.be.reverted;
      await expect(triinl.connect(otherAccount).unpause()).to.be.reverted;
    });
  });
});
