import { ethers } from "ethers";
import {contractABI} from "../abi/contractABI";
import {contractAddress} from "../abi/contractAddress";

export async function connectContract() {
  if (!window.ethereum) {
    alert("MetaMask não encontrada");
    return null;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}


//VIEW FUNCTIONS


export async function getRoles() {
  const contract = await connectContract();
  if(!contract){
        console.log("SEM CONTRATO:",contract);
        return;
    }

  const adminRole = await contract.DEFAULT_ADMIN_ROLE();
  const libraryRole = await contract.LIBRARY_ROLE();
  const userRole = await contract.USER_ROLE();

  return { adminRole, libraryRole, userRole };
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
    return balances.map(balance => balance.toString());
  } catch (error) {
    console.error("Erro ao buscar saldos batch:", error);
    throw error;
  }
}

export async function getBook(contract, bookId) {
  try {
    const book = await contract.books(bookId);

    // O retorno é um objeto com várias propriedades
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      doi: book.doi,
      ano: book.ano,
      uri: book.uri,
      instituicao: book.instituicao
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
      doi: book.doi,
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
    const [name, sigla, isActive] = await contract.getLibrary(libraryAddress);
    return { name, sigla, isActive };
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
      status: loanRequest.status,  // normalmente um uint8 representando um estado
    };
  } catch (error) {
    console.error("Erro ao obter o pedido de empréstimo:", error);
    throw error;
  }
}

export async function getNextBookId(contract) {
  try {
    const nextId = await contract.nextBookId();
    return nextId 
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

export async function isPaused(contract) {
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

export async function grantRole(contract, role, account, signer) {
  try {
    const tx = await contract.connect(signer).grantRole(role, account);
    await tx.wait();  // Espera a confirmação da transação
    console.log(`Role concedido com sucesso à conta ${account}`);
  } catch (error) {
    console.error("Erro ao conceder role:", error);
    throw error;
  }
}

export async function mint(
  contract,
  signer,
  amount,
  title,
  author,
  isbn,
  doi,
  ano,
  uriSuffix
) {
  try {
    const tx = await contract.connect(signer).mint(
      amount,
      title,
      author,
      isbn,
      doi,
      ano,
      uriSuffix
    );
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

export async function registerLibrary(contract, signer, libraryAddress, name, sigla) {
  try {
    const tx = await contract.connect(signer).registerLibrary(libraryAddress, name, sigla);
    await tx.wait(); // espera a confirmação da transação
    console.log("Biblioteca registrada com sucesso!");
  } catch (error) {
    console.error("Erro ao registrar a biblioteca:", error);
    throw error;
  }
}

export async function renounceRole(contract, signer, role, callerConfirmation) {
  try {
    const tx = await contract.connect(signer).renounceRole(role, callerConfirmation);
    await tx.wait(); // espera a confirmação da transação
    console.log("Role renunciada com sucesso!");
  } catch (error) {
    console.error("Erro ao renunciar role:", error);
    throw error;
  }
}

export async function requestLoanAndGetId(contract, signer, libraryFrom, bookId, amount) {
  try {
    // Envia a tx da função requestLoan
    const tx = await contract.connect(signer).requestLoan(libraryFrom, bookId, amount);
    const receipt = await tx.wait(); // Espera a confirmação da tx

    // Busca o evento LoanRequested no receipt
    const event = receipt.events.find(e => e.event === "LoanRequested");

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
    console.log('Empréstimo devolvido com sucesso:', receipt);
  } catch (error) {
    console.error('Erro ao devolver empréstimo:', error);
  }
}

export async function revokeRole(contract, signer, role, account) {
  try {
    // Chama a função revokeRole passando o role (bytes32) e a conta (address)
    const tx = await contract.connect(signer).revokeRole(role, account);
    const receipt = await tx.wait(); // Espera a confirmação da transação
    console.log(`Role revogada com sucesso para a conta ${account}`, receipt);
  } catch (error) {
    console.error('Erro ao revogar role:', error);
  }
}

//tirar funções batchs
export async function safeBatchTransferFrom(contract, signer, from, to, ids, values, data) {
  try {
    // Chama a função safeBatchTransferFrom com os parâmetros necessários
    const tx = await contract.connect(signer).safeBatchTransferFrom(from, to, ids, values, data);
    const receipt = await tx.wait(); // Espera a confirmação da transação
    console.log('Transferência em lote realizada com sucesso', receipt);
  } catch (error) {
    console.error('Erro na transferência em lote:', error);
  }
}

export async function safeTransferFrom(contract, signer, from, to, id, value, data) {
  try {
    // Executa a transferência segura de token único
    const tx = await contract.connect(signer).safeTransferFrom(from, to, id, value, data);
    const receipt = await tx.wait(); // Aguarda a confirmação da transação
    console.log('Transferência segura realizada com sucesso:', receipt);
  } catch (error) {
    console.error('Erro na transferência segura:', error);
  }
}

export async function setApprovalForAll(contract, signer, operator, approved) {
  try {
    // Envia a transação para aprovar ou revogar aprovação para o operador
    const tx = await contract.connect(signer).setApprovalForAll(operator, approved);
    const receipt = await tx.wait(); // espera a confirmação da transação
    console.log('Aprovação atualizada com sucesso:', receipt);
  } catch (error) {
    console.error('Erro ao atualizar aprovação:', error);
  }
}

export async function setURI(contract, signer, newuri) {
  try {
    // Envia a transação para atualizar a URI
    const tx = await contract.connect(signer).setURI(newuri);
    const receipt = await tx.wait(); // espera a confirmação da transação
    console.log('URI atualizada com sucesso:', receipt);
  } catch (error) {
    console.error('Erro ao atualizar URI:', error);
  }
}

export async function transferBetweenLibraries(contract, signer, from, to, id, amount, data) {
  try {
    const tx = await contract.connect(signer).transferBetweenLibraries(from, to, id, amount, data);
    const receipt = await tx.wait();  // espera a confirmação da transação
    console.log('Transferência entre bibliotecas realizada:', receipt);
  } catch (error) {
    console.error('Erro na transferência entre bibliotecas:', error);
  }
}

export async function unpause(contract, signer) {
  try {
    const tx = await contract.connect(signer).unpause();
    const receipt = await tx.wait();
    console.log('Contrato despausado:', receipt);
  } catch (error) {
    console.error('Erro ao despausar o contrato:', error);
  }
}