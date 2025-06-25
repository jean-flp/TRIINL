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
import express from 'express';
import multer from 'multer';
import mime from 'mime-types'; // Para determinar o Content-Type


import cors from 'cors'

//tentar usar nomeoriginal + account + data
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
let hashMap = new Map();

async function createNode() {
  const { createHelia } = await import('helia');
  const { unixfs } = await import('@helia/unixfs');

  const helia = await createHelia();
  const fs = unixfs(helia);
  return { helia, fs };
}

async function run() {
  const { fs, helia } = await createNode();

  app.post('/upload', upload.single('file'), async (req, res) => {
    const data = req.file.buffer;
    const cid = await fs.addBytes(data);
    console.log('CID:', cid.toString());

    hashMap.set(req.file.originalname, cid.toString()); // Armazena o CID como string
    res.status(201).json({ message: 'Arquivo uploaded', cid: cid.toString() });
  });

  app.get('/fetch', async (req, res) => {
    const filename = req.body.filename;
    const cid = hashMap.get(filename);
    if (!cid) {
      res.status(404).send('Não achou o arquivo');
      return;
    }

    // Para arquivos de texto, mantém a decodificação como texto
    let text = '';
    const decoder = new TextDecoder();
    try {
      for await (const chunk of fs.cat(cid)) {
        text += decoder.decode(chunk, { stream: true });
      }
      res.status(200).send(text);
    } catch (error) {
      res.status(500).send('Erro ao recuperar o arquivo');
    }
  });

  // Novo endpoint para servir arquivos binários (como imagens) no navegador
  app.get('/ipfs/:cid', async (req, res) => {
    const cid = req.params.cid;
    if (!cid) {
      res.status(400).send('CID não fornecido');
      return;
    }

    try {
      // Determina o Content-Type com base no nome do arquivo associado ao CID
      let contentType = 'application/octet-stream'; // Padrão para binários genéricos
      for (const [filename, storedCid] of hashMap) {
        if (storedCid === cid) {
          contentType = mime.lookup(filename) || contentType;
          break;
        }
      }

      res.set('Content-Type', contentType);

      // Envia os dados binários diretamente
      for await (const chunk of fs.cat(cid)) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error('Erro ao servir CID:', error);
      res.status(500).send('Erro ao recuperar o arquivo');
    }
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`IPFS rodando na porta:${PORT}`);
  });

  // Mantém o nó Helia ativo até o servidor ser encerrado
  process.on('SIGINT', async () => {
    console.log('Encerrando o nó Helia...');
    await helia.stop();
    process.exit(0);
  });
}

run().catch(console.error);