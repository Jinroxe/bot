// start-all.js
import { spawn } from "child_process";
import path from "path";
import process from "process";

function runProcess(command, args, cwd, name) {
  const child = spawn(command, args, { cwd, stdio: "inherit", shell: true });
  child.on("close", code => {
    if (code !== 0) {
      console.error(`❌ Le processus ${name} s'est arrêté avec le code ${code}`);
    }
  });
  return child;
}

async function main() {
  console.log("🚀 Lancement du bot Discord et du panel web...");

  // Lancer le bot Discord
  const botProcess = runProcess("node", ["index.js"], path.join(process.cwd(), "bot"), "bot");

  // Lancer le panel Next.js (dev)
  const panelProcess = runProcess("npm", ["run", "dev"], path.join(process.cwd(), "panel"), "panel");

  console.log("\n✅ Les deux services sont lancés !");
  console.log("➡️  Panel web : http://localhost:1787/config");
  console.log("➡️  Bot Discord : Vérifie Discord pour l'activité du bot.");
  console.log("\nℹ️  Appuie sur Ctrl+C pour arrêter tous les services.\n");

  // Gérer l'arrêt proprement
  process.on("SIGINT", () => {
    console.log("\n⏹️  Arrêt des services...");
    botProcess.kill();
    panelProcess.kill();
    process.exit();
  });
}

main();