import axios from 'axios';
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
    const errMsg = err.response?.data?.message || err.message || "Erro desconhecido";
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
    formData.append('file', renamedFile); // 'file' deve corresponder ao campo esperado pelo multer

    const response = await httpPost(
      "http://localhost:3000/upload",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Necessário para multer
        },
      }
    );
    return response.name;
  } catch (error) {
    console.error("Erro ao fazer upload da capa:", error);
    throw error;
  }
}
