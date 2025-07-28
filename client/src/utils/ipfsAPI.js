import axios from "axios";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

async function client(endpoint, { body, ...customConfig } = {}) {
  const config = {
    url: endpoint,
    method: body ? "POST" : "GET",
    data: body,
    headers: {
      ...customConfig.headers,
    },
    ...customConfig,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (err) {
    const errMsg =
      err.response?.data?.message || err.message || "Erro desconhecido";
    return Promise.reject(errMsg);
  }
}

export const httpGet = async function (endpoint, customConfig = {}) {
  return client(endpoint, { ...customConfig, method: "GET" });
};

export const httpPost = async function (endpoint, body, customConfig = {}) {
  return client(endpoint, { body, ...customConfig, method: "POST" });
};

export const httpPut = async function (endpoint, body, customConfig = {}) {
  return client(endpoint, { body, ...customConfig, method: "PUT" });
};

export const httpDelete = async function (endpoint, customConfig = {}) {
  return client(endpoint, { ...customConfig, method: "DELETE" });
};

export async function putBookCover(bookcover, wallet) {
  try {
    const timestamp = Date.now();
    const temp = `${wallet}_${timestamp}_${bookcover.name}`;
    const uniqueName = keccak256(toUtf8Bytes(temp)).slice(2);

    // Cria um novo objeto File com o nome alterado
    const renamedFile = new File([bookcover], uniqueName, {
      type: bookcover.type,
      lastModified: bookcover.lastModified,
    });

    const formData = new FormData();
    formData.append("file", renamedFile); // 'file' deve corresponder ao campo esperado pelo multer

    const response = await httpPost("http://localhost:3000/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Necessário para multer
      },
    });
    return response.name;
  } catch (error) {
    console.error("Erro ao fazer upload da capa:", error);
    throw error;
  }
}
export async function createMetaDado(book,lib) {

  try{
      // {
  //   "name": "Example Book",
  //     "description": "A book NFT from the TRIINL library system",
  //       "image": "https://ipfs.io/ipfs/QmX.../book-image.png",
  //         "attributes": [
  //           { "trait_type": "Title", "value": "Example Book" },
  //           { "trait_type": "Author", "value": "John Doe" },
  //           { "trait_type": "ISBN", "value": "1234567890" },
  //           { "trait_type": "Year", "value": "2023" }
  //         ]
  // }

  const temp = `${book.title}-${book.isbn}-${lib}`
  const uniqueName = keccak256(toUtf8Bytes(temp)).slice(2);

  const metadado = {
    name:book.title,
    description: `Livro cedido por ${lib}, pessoalmente realize a devolução.`,
    image: `http://localhost:3000/ipfs/${book.uriSuffix}`,
    attributes:[
      {
        trait_type:"Título",
        value:book.title,
      },
      {
        trait_type:"Author",
        value:book.author,
      },
      {
        trait_type:"ISBN",
        value:book.isbn,
      },
      {
        trait_type:"Ano",
        value:book.ano,
      },
    ]
  };

  // Converter o objeto JSON em um Buffer
    const jsonString = JSON.stringify(metadado);
    const blob = new Blob([jsonString], { type: "application/json" });

     // Criar FormData para enviar ao backend
    const formData = new FormData();
    formData.append("file", blob, uniqueName);

    console.log("DATA JSON:", formData);

    const response = await httpPost(
      "http://localhost:3000/upload/metadado",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("createMetaDado response:", response);

    if (typeof response.name !== "string") {
      throw new Error("Invalid metaUri from IPFS upload");
    }

    return response.name;
  } catch (error) {
    console.error("Erro ao fazer upload de metadado:", error);
    throw error;
  }
}

// ====================================================================
export async function getBookCover(uriSuffix) {
  // Check if uriSuffix is valid to prevent unnecessary requests
  if (!uriSuffix || typeof uriSuffix !== "string" || uriSuffix.trim() === "") {
    console.error("getBookCover called with invalid uriSuffix.");
    // Return a placeholder or throw an error
    return "https://placehold.co/345x200/cccccc/ffffff?text=Invalid+ID";
  }

  try {
    // 1. Construct the full URL with the name as a parameter
    const url = `http://localhost:3000/ipfs/${uriSuffix}`;

    // 2. Make a GET request with axios, expecting the response as a 'blob'
    const response = await axios.get(url, {
      responseType: "blob",
    });

    // 3. Create a temporary object URL from the blob data
    // This URL can be used directly in an <img src="..."> tag
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error(`Erro ao buscar a capa para "${uriSuffix}":`, error);
    // Return a placeholder image on error so the UI doesn't break
    return "https://placehold.co/345x200/f03e3e/ffffff?text=Capa+Não+Encontrada";
  }
}
