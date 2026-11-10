import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  readFileSync,
  writeFileSync,
} from "node:fs";

import { createInterface } from "node:readline/promises";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pin = await rl.question("Choisis un nouveau PIN à 6 chiffres : ");
const confirmation = await rl.question("Confirme ton PIN : ");

rl.close();

if (!/^\d{6}$/.test(pin) || pin !== confirmation) {
  console.error("PIN invalide ou confirmation différente.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pin, salt, 64).toString("hex");

const adminHash = `scrypt$${salt}$${hash}`;
const sessionSecret = randomBytes(48).toString("hex");

const file = ".env.local";

let content = "";

try {
  content = readFileSync(file, "utf8");
} catch {
  console.error(".env.local introuvable.");
  process.exit(1);
}

function updateVariable(key, value) {
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter(
    line => !new RegExp(`^\\s*${key}\\s*=`).test(line)
  );

  filtered.push(`${key}="${value.replace(/\$/g, "\\$")}"`);

  content = filtered.join("\n");
}

updateVariable("ADMIN_PIN_HASH", adminHash);
updateVariable("ADMIN_SESSION_SECRET", sessionSecret);

writeFileSync(file, content, "utf8");

console.log("\nConfiguration enregistrée !");
console.log("Format du hash :", adminHash.length === 168);
console.log("Hash valide :", /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(adminHash));
console.log("Secret valide :", sessionSecret.length >= 32);
console.log("Aucune clé secrète affichée.");