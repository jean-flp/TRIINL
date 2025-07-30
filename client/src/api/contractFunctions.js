import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "ethers";
import { contractABI } from "../abi/contractABI";
import { contractAddress } from "../abi/contractAddress";

//VIEW FUNCTIONS

export const LIBRARY_ROLE = keccak256(toUtf8Bytes("LIBRARY_ROLE"));
export const USER_ROLE = keccak256(toUtf8Bytes("USER_ROLE"));
export const ADMIN_ROLE = ethers.constants.HashZero;

export function getRoles() {
  return {
    admin: ADMIN_ROLE,
    library: LIBRARY_ROLE,
    user: USER_ROLE,
  };
}
export async function selfRegisterAsUser(contract, signer, email) {
  try {
    // conecta o contrato ao signer (carteira que irá assinar a tx)
    const contractWithSigner = contract.connect(signer);

    // envia a transação para executar selfRegisterAsUser
    const tx = await contractWithSigner.selfRegisterAsUser(email);
    // espera a confirmação da transação
    const receipt = await tx.wait();

    return receipt.confirmations;
  } catch (error) {
    console.error("Erro na selfRegisterAsUser:", error);
  }
}

export async function balanceOf(contract, account, id) {
  try {
    // Chama a função 'balanceOf' do contrato
    const balance = await contract.balanceOf(account, id);

    // balance é um BigNumber, converta para string para exibir
    return balance.toString();
  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    throw error;
  }
}

export async function getBalanceOfBatch(contract, accounts, ids) {
  try {
    // Chama a função 'balanceOfBatch' do contrato
    const balances = await contract.balanceOfBatch(accounts, ids);

    // balances é um array de BigNumbers, converta para string para facilitar leitura
    return balances.map((balance) => balance.toString());
  } catch (error) {
    console.error("Erro ao buscar saldos batch:", error);
    throw error;
  }
}

export async function getBook(contract, bookId) {
  try {
    const book = await contract.books(bookId);
    // O retorno é um objeto com várias propriedades
    const bookBalanceBigInt = await contract.balanceOf(
      book.instituicao,
      bookId
    );
    const bookBalance = Number(bookBalanceBigInt);
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      ano: book.ano,
      uri: book.uri,
      metaUri: book.metaUri,
      amount: bookBalance,
      instituicao: book.instituicao,
    };
  } catch (error) {
    console.error("Erro ao buscar o livro:", error);
    throw error;
  }
}

export async function checkExists(contract, id) {
  try {
    const doesExist = await contract.exists(id);
    return doesExist; // booleano true ou false
  } catch (error) {
    console.error("Erro ao verificar existência:", error);
    throw error;
  }
}

export async function getBookRETIRAR(contract, bookId) {
  try {
    const book = await contract.getBook(bookId);
    // book é um objeto com as propriedades da struct Book
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      ano: book.ano,
      uri: book.uri,
      instituicao: book.instituicao,
    };
  } catch (error) {
    console.error("Erro ao obter livro:", error);
    throw error;
  }
}

export async function getLibrary(contract, libraryAddress) {
  try {
    const [name, sigla, email, isActive] = await contract.getLibrary(libraryAddress);
    return { name, sigla, email, isActive };
  } catch (error) {
    console.error("Erro ao obter biblioteca:", error);
    throw error;
  }
}

export async function getRoleAdmin(contract, role) {
  try {
    const adminRole = await contract.getRoleAdmin(role);
    return adminRole;
  } catch (error) {
    console.error("Erro ao obter role admin:", error);
    throw error;
  }
}

export async function hasRole(contract, role, account) {
  try {
    const result = await contract.hasRole(role, account);
    return result; // true ou false
  } catch (error) {
    console.error("Erro ao verificar role:", error);
    throw error;
  }
}

// Função para obter o e-mail do usuário do contrato
export const getUserEmail = async (contract, userAddress) => {
  try {
    const email = await contract.getUserEmail(userAddress);
    return email;
  } catch (error) {
    console.error("Erro ao obter e-mail do usuário:", error);
    return ""; // Retorna string vazia em caso de erro
  }
};

export async function isApprovedForAll(contract, account, operator) {
  try {
    const approved = await contract.isApprovedForAll(account, operator);
    return approved; // true ou false
  } catch (error) {
    console.error("Erro ao verificar aprovação:", error);
    throw error;
  }
}

export async function getLibraryInfo(contract, libraryAddress) {
  try {
    const libraryData = await contract.libraries(libraryAddress);
    // libraryData é um objeto com { name, sigla, isActive }
    return {
      name: libraryData.name,
      sigla: libraryData.sigla,
      email: libraryData.enderecoEmail,
      isActive: libraryData.isActive,
    };
  } catch (error) {
    console.error("Erro ao obter dados da biblioteca:", error);
    throw error;
  }
}

export async function getLoanRequest(contract, loanRequestId) {
  try {
    const loanRequest = await contract.loanRequests(loanRequestId);
    // loanRequest é um objeto com os campos user, libraryFrom, bookId, amount, status
    return {
      user: loanRequest.user,
      libraryFrom: loanRequest.libraryFrom,
      bookId: loanRequest.bookId.toString(),
      amount: loanRequest.amount.toString(),
      status: loanRequest.status, // normalmente um uint8 representando um estado
    };
  } catch (error) {
    console.error("Erro ao obter o pedido de empréstimo:", error);
    throw error;
  }
}

export async function getNextBookId(contract) {
  try {
    const nextId = await contract.nextBookId();
    return nextId;
  } catch (error) {
    console.error("Erro ao obter o próximo Book ID:", error);
    throw error;
  }
}

export async function getAllLibraryAdresses(contract) {
  try {
    const allLib = await contract.getAllRegisteredLibraryAddresses();
    return allLib;
  } catch (error) {
    console.error("Erro ao obter o próximo Book ID:", error);
    throw error;
  }
}

export async function getNextLoanId(contract) {
  try {
    const nextId = await contract.nextLoanId();
    return nextId.toString(); // retorna o ID como string para facilitar o uso
  } catch (error) {
    console.error("Erro ao obter o próximo Loan ID:", error);
    throw error;
  }
}

export async function _isPaused(contract) {
  try {
    const paused = await contract.paused();
    return paused; // booleano indicando se está pausado ou não
  } catch (error) {
    console.error("Erro ao verificar se está pausado:", error);
    throw error;
  }
}

export async function supportsInterface(contract, interfaceId) {
  try {
    const isSupported = await contract.supportsInterface(interfaceId);
    return isSupported; // booleano indicando se a interface é suportada
  } catch (error) {
    console.error("Erro ao verificar suporte à interface:", error);
    throw error;
  }
}

export async function totalSupply(contract) {
  try {
    const supply = await contract.totalSupply();
    return supply; // Retorna um BigNumber representando o totalSupply
  } catch (error) {
    console.error("Erro ao obter totalSupply:", error);
    throw error;
  }
}

export async function totalSupplyById(contract, id) {
  try {
    const supply = await contract.totalSupply(id);
    return supply; // BigNumber representando o totalSupply do token com o id fornecido
  } catch (error) {
    console.error("Erro ao obter totalSupply por ID:", error);
    throw error;
  }
}

export async function getUri(contract, tokenId) {
  try {
    const tokenUri = await contract.uri(tokenId);
    return tokenUri; // String com a URI do token
  } catch (error) {
    console.error("Erro ao obter URI do token:", error);
    throw error;
  }
}

//FUNCTIONS
export async function approveLoan(contract, loanId, signer) {
  try {
    const tx = await contract.connect(signer).approveLoan(loanId);
    await tx.wait(); // Espera a confirmação da transação
    console.log(`Empréstimo ${loanId} aprovado com sucesso.`);
  } catch (error) {
    console.error("Erro ao aprovar empréstimo:", error);
    throw error;
  }
}

export async function burnTokens(contract, account, id, value, signer) {
  try {
    const tx = await contract.connect(signer).burn(account, id, value);
    await tx.wait(); // espera a confirmação da transação
    console.log(`Queimou ${value} tokens do id ${id} da conta ${account}.`);
  } catch (error) {
    console.error("Erro ao queimar tokens:", error);
    throw error;
  }
}

// export async function grantRole(contract, role, account, signer) {
//   try {
//     const tx = await contract.connect(signer).grantRole(role, account);
//     await tx.wait();  // Espera a confirmação da transação
//     console.log(`Role concedido com sucesso à conta ${account}`);
//   } catch (error) {
//     console.error("Erro ao conceder role:", error);
//     throw error;
//   }
// }

// // Supondo que você já tenha o contrato conectado com um signer
export async function grantRole(contract, role, account) {
  try {
    const tx = await contract.grantRole(role, account);
    console.log("Transação enviada:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transação confirmada:", receipt.transactionHash);
  } catch (error) {
    console.error("Erro ao executar grantRole:", error);
  }
}

export async function mint(
  contract,
  signer,
  amount,
  title,
  author,
  isbn,
  ano,
  uriSuffix,
  metaUri
) {
  try {
    const tx = await contract
      .connect(signer)
      .mint(amount, title, author, isbn, ano, uriSuffix,metaUri);
    await tx.wait(); // Espera a confirmação da transação
    console.log("Mint realizado com sucesso!");
    return tx;
  } catch (error) {
    console.error("Erro ao executar mint:", error);
    throw error;
  }
}

export async function mintRestock(contract, signer, amount, id) {
  try {
    const tx = await contract.connect(signer).mintRestock(amount, id);
    await tx.wait(); // aguarda a confirmação da transação
    console.log("mintRestock executado com sucesso!");
  } catch (error) {
    console.error("Erro ao executar mintRestock:", error);
    throw error;
  }
}

export async function pauseContract(contract, signer) {
  try {
    const tx = await contract.connect(signer).pause();
    await tx.wait(); // aguarda a confirmação da transação
    console.log("Contrato pausado com sucesso!");
  } catch (error) {
    console.error("Erro ao pausar o contrato:", error);
    throw error;
  }
}

export async function registerLibrary(
  contract,
  libraryAddress,
  name,
  email,
  sigla
) {
  try {
    const tx = await contract.registerLibrary(
      libraryAddress,
      name,
      email,
      sigla
    );
    await tx.wait(); // espera a confirmação da transação
    console.log("Biblioteca registrada com sucesso!");
  } catch (error) {
    console.error("Erro ao registrar a biblioteca:", error);
    throw error;
  }
}

export async function renounceRole(contract, signer, role, callerConfirmation) {
  try {
    const tx = await contract
      .connect(signer)
      .renounceRole(role, callerConfirmation);
    await tx.wait(); // espera a confirmação da transação
    console.log("Role renunciada com sucesso!");
  } catch (error) {
    console.error("Erro ao renunciar role:", error);
    throw error;
  }
}

export async function requestLoanAndGetId(
  contract,
  signer,
  libraryFrom,
  bookId,
  amount
) {
  try {
    // Envia a tx da função requestLoan
    const tx = await contract
      .connect(signer)
      .requestLoan(libraryFrom, bookId, amount);
    const receipt = await tx.wait(); // Espera a confirmação da tx

    // Busca o evento LoanRequested no receipt
    const event = receipt.events.find((e) => e.event === "LoanRequested");

    if (event) {
      const loanId = event.args.loanId;
      console.log("Loan ID obtido do evento:", loanId.toString());
      return loanId;
    } else {
      console.log("Evento LoanRequested não encontrado no receipt.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao solicitar empréstimo:", error);
    throw error;
  }
}

export async function returnLoan(contract, signer, loanId) {
  try {
    // Conecta o signer e chama a função returnLoan com o loanId
    const tx = await contract.connect(signer).returnLoan(loanId);
    const receipt = await tx.wait(); // Espera a confirmação da transação
    console.log("Empréstimo devolvido com sucesso:", receipt);
  } catch (error) {
    console.error("Erro ao devolver empréstimo:", error);
  }
}

export async function revokeRole(contract, signer, role, account) {
  try {
    // Chama a função revokeRole passando o role (bytes32) e a conta (address)
    const tx = await contract.connect(signer).revokeRole(role, account);
    const receipt = await tx.wait(); // Espera a confirmação da transação
    console.log(`Role revogada com sucesso para a conta ${account}`, receipt);
  } catch (error) {
    console.error("Erro ao revogar role:", error);
  }
}

//tirar funções batchs
export async function safeBatchTransferFrom(
  contract,
  signer,
  from,
  to,
  ids,
  values,
  data
) {
  try {
    // Chama a função safeBatchTransferFrom com os parâmetros necessários
    const tx = await contract
      .connect(signer)
      .safeBatchTransferFrom(from, to, ids, values, data);
    const receipt = await tx.wait(); // Espera a confirmação da transação
    console.log("Transferência em lote realizada com sucesso", receipt);
  } catch (error) {
    console.error("Erro na transferência em lote:", error);
  }
}

export async function safeTransferFrom(
  contract,
  signer,
  from,
  to,
  id,
  value,
  data
) {
  try {
    // Executa a transferência segura de token único
    const tx = await contract
      .connect(signer)
      .safeTransferFrom(from, to, id, value, data);
    const receipt = await tx.wait(); // Aguarda a confirmação da transação
    console.log("Transferência segura realizada com sucesso:", receipt);
  } catch (error) {
    console.error("Erro na transferência segura:", error);
  }
}

export async function setApprovalForAll(contract, signer, operator, approved) {
  try {
    // Envia a transação para aprovar ou revogar aprovação para o operador
    const tx = await contract
      .connect(signer)
      .setApprovalForAll(operator, approved);
    const receipt = await tx.wait(); // espera a confirmação da transação
    console.log("Aprovação atualizada com sucesso:", receipt);
  } catch (error) {
    console.error("Erro ao atualizar aprovação:", error);
  }
}

export async function setURI(contract, signer, newuri) {
  try {
    // Envia a transação para atualizar a URI
    const tx = await contract.connect(signer).setURI(newuri);
    const receipt = await tx.wait(); // espera a confirmação da transação
    console.log("URI atualizada com sucesso:", receipt);
  } catch (error) {
    console.error("Erro ao atualizar URI:", error);
  }
}

export async function transferBetweenLibraries(
  contract,
  signer,
  from,
  to,
  id,
  amount,
  data
) {
  try {
    const tx = await contract
      .connect(signer)
      .transferBetweenLibraries(from, to, id, amount, data);
    const receipt = await tx.wait(); // espera a confirmação da transação
    console.log("Transferência entre bibliotecas realizada:", receipt);
  } catch (error) {
    console.error("Erro na transferência entre bibliotecas:", error);
  }
}

export async function unpause(contract, signer) {
  try {
    const tx = await contract.connect(signer).unpause();
    const receipt = await tx.wait();
    console.log("Contrato despausado:", receipt);
  } catch (error) {
    console.error("Erro ao despausar o contrato:", error);
  }
}

export async function deactivateLibrary(contractInstance, libraryAddress) {
  try {
    console.log(`Deactivating library ${libraryAddress}...`);

    //const tx = await contractInstance.connect(senderSigner).deactivateLibrary(libraryAddress);
    const tx2 = await contractInstance.deactivateLibrary(libraryAddress);

    //console.log("Transaction sent:", tx.hash);
    console.log("Transaction sent tx2:", tx2.hash);

    //const receipt = await tx.wait();

    const receipt2 = await tx2.wait();

    /*console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log(`Library ${libraryAddress} successfully deactivated.`);*/

    console.log("Transaction confirmed in block tx2:", receipt2.blockNumber);
    console.log("Gas used tx2:", receipt2.gasUsed.toString());
    console.log(`Library tx2 ${libraryAddress} successfully deactivated.`);

    return receipt2;
  } catch (error) {
    console.error("Error deactivating library:", error.message);
    throw error;
  }
}

export const bookWithUser = async (contract, signer, loanId) => {
  try {
    if (!contract) throw new Error("Contract instance is not available.");
    const tx = await contract.connect(signer).bookWithUser(loanId);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error(`Error marking loan ${loanId} as withdrawn:`, error);

    throw error;
  }
};

export const rejectLoan = async (contract, signer, loanId) => {
  try {
    if (!contract) throw new Error("Contract instance is not available.");

    const tx = await contract.connect(signer).rejectLoan(loanId);

    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error(`Error rejecting loan ${loanId}:`, error);
    throw error;
  }
};
