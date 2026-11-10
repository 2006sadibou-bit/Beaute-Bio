import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

const pin = await rl.question("Saisissez votre code PIN à 6 chiffres : ");

rl.close();

if (!/^\d{6}$/.test(pin)) {
  console.error("Le PIN doit contenir exactement 6 chiffres.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pin, salt, 64).toString("hex");

console.log("\nVotre hash ADMIN_PIN_HASH :\n");
console.log(`scrypt$${salt}$${hash}`);