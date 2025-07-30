if (!Promise.withResolvers) {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors({ origin: "*" }));
app.use(express.json());
const hashMap = new Map();

async function createNode() {
  const { createHelia } = await import("helia");
  const { unixfs } = await import("@helia/unixfs");

  try {
    const helia = await createHelia();
    const fs = unixfs(helia);
    return { helia, fs };
  } catch (error) {
    console.error("Erro ao inicializar o nó Helia:", error);
    throw error;
  }
}

async function run() {
  hashMap.clear(); //??????
  const { fs, helia } = await createNode();

  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        console.error('Nenhum arquivo enviado no campo "file"');
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const data = req.file.buffer;
      const cid = await fs.addBytes(data);
      const cidStr = cid.toString();
      const originalname = req.file.originalname;

      // Armazena o CID e o Content-Type no hashMap
      hashMap.set(originalname, {
        cid: cidStr,
        contentType: req.file.mimetype || "application/octet-stream",
      });

      console.log("Arquivo enviado:", {
        originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        cid: cidStr,
      });
      console.log("hashMap atualizado:", Array.from(hashMap.entries()));

      res
        .status(201)
        .json({ message: "Arquivo uploaded", name: originalname, cid: cidStr });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      res
        .status(500)
        .json({
          message: "Erro ao fazer upload do arquivo",
          error: error.message,
        });
    }
  });
  app.post("/upload/metadado", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        console.error('Nenhum arquivo enviado no campo "file"');
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const data = req.file.buffer;
      const cid = await fs.addBytes(data);
      const cidStr = cid.toString();
      const originalname = req.file.originalname;

      hashMap.set(originalname, {
        cid: cidStr,
        contentType: req.file.mimetype || "application/json",
      });

      console.log("Metadado enviado:", {
        originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        cid: cidStr,
      });
      console.log("hashMap atualizado:", Array.from(hashMap.entries()));

      res
        .status(201)
        .json({ message: "Metadado uploaded", name: originalname, cid: cidStr });
    } catch (error) {
      console.error("Erro ao fazer upload de metadado:", error);
      res
        .status(500)
        .json({
          message: "Erro ao fazer upload do metadado",
          error: error.message,
        });
    }
  });
  app.get("/ipfs/upload/metadado/:name", async (req, res) => {
    const name = req.params.name;
    if (!name) {
      console.error("Nome do metadado não fornecido");
      return res.status(400).send("Nome do metadado não fornecido");
    }

    try {
      const fileData = hashMap.get(name);
      if (!fileData) {
        console.error("Metadado não encontrado no hashMap:", name);
        console.log(
          "Conteúdo atual do hashMap:",
          Array.from(hashMap.entries())
        );
        return res.status(404).send("Metadado não encontrado");
      }

      const { cid, contentType } = fileData;

      if (!cid) {
        console.error("Metadado não encontrado no hashMap:", name);
        return res.status(404).send("Metadado não encontrado");
      }

      console.log("Servindo metadado:", { cid, contentType, name });

      res.set("Content-Type", contentType);
      for await (const chunk of fs.cat(cid)) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error("Erro ao servir metadado:", error);
      res.status(500).send(`Erro ao recuperar o metadado: ${error.message}`);
    }
  });
  //USO MAIS PARA ARQUIVO TEXTO
  app.get("/fetch", async (req, res) => {
    const filename = req.body.filename;
    const fileData = hashMap.get(filename);
    if (!fileData) {
      console.error("Arquivo não encontrado no hashMap:", filename);
      return res.status(404).send("Não achou o arquivo");
    }

    try {
      let text = "";
      const decoder = new TextDecoder();
      for await (const chunk of fs.cat(fileData.cid)) {
        text += decoder.decode(chunk, { stream: true });
      }
      res.status(200).send(text);
    } catch (error) {
      console.error("Erro ao recuperar arquivo:", error);
      res.status(500).send("Erro ao recuperar o arquivo");
    }
  });
  //USO PARA FETCH DE IMAGEM
  app.get("/ipfs/:name", async (req, res) => {
    const name = req.params.name;
    if (!name) {
      console.error("Nome do arquivo não fornecido");
      return res.status(400).send("Nome do arquivo não fornecido");
    }

    try {
      const fileData = hashMap.get(name);
      if (!fileData) {
        console.error("Nome de arquivo não encontrado no hashMap:", name);
        console.log(
          "Conteúdo atual do hashMap:",
          Array.from(hashMap.entries())
        );
        return res.status(404).send("Nome de arquivo não encontrado");
      }

      const { cid, contentType } = fileData;

      if (!cid) {
        console.error("Nome de arquivo não encontrado no hashMap:", name);
        return res.status(404).send("Nome de arquivo não encontrado");
      }

      console.log("Servindo arquivo:", { cid, contentType, name });

      res.set("Content-Type", contentType);
      for await (const chunk of fs.cat(cid)) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error("Erro ao servir CID:", error);
      res.status(500).send(`Erro ao recuperar o arquivo: ${error.message}`);
    }
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`IPFS rodando na porta:${PORT}`);
  });

  process.on("SIGINT", async () => {
    console.log("Encerrando o nó Helia...");
    await helia.stop();
    process.exit(0);
  });
}

run().catch(console.error);
