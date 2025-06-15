const fs = require("fs");
const path = require("path");

const pasta = path.join(__dirname, "ignition/deployments");
console.log("PASTA RMV",pasta)

if (fs.existsSync(pasta)) {
  fs.rmSync(pasta, { recursive: true, force: true });
  console.log("✅ Pasta excluída com sucesso!");
} else {
  console.log("⚠️ Pasta não encontrada.");
}
