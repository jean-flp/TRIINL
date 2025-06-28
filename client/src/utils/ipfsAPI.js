import axios from 'axios';

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

export async function putBookCover(bookcover) {
  try {
    //Há atualmente problema em endereçar duas fotos com o mesmo nome, pois o cid para de funcionar para a foto mais antiga
    const formData = new FormData();
    formData.append('file', bookcover); // 'file' deve corresponder ao campo esperado pelo multer
    const response = await httpPost(
      "http://localhost:3000/upload",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // Necessário para multer
        },
      }
    );
    console.log("Resposta JSON:", response);
    return response.cid;
  } catch (error) {
    console.error("Erro ao fazer upload da capa:", error);
    throw error;
  }
}
