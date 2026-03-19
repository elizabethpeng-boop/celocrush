// scripts/deploy.js
// Run: npx hardhat run scripts/deploy.js --network celoSepolia

const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

// USDT on Celo Sepolia (cUSD as stand-in — swap for real USDT once bridged)
const USDT_CELO_SEPOLIA = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying CeloCrush with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "CELO");

  const CeloCrush = await hre.ethers.getContractFactory("CeloCrush");
  const contract  = await CeloCrush.deploy(USDT_CELO_SEPOLIA);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ CeloCrush deployed to:", address);
  console.log("   Network:  Celo Sepolia");
  console.log("   USDT:    ", USDT_CELO_SEPOLIA);
  console.log("   Explorer: https://alfajores.celoscan.io/address/" + address);

  // Auto-write address to .env file
  const envPath = path.join(__dirname, "../.env");
  const envLine = `\nVITE_CONTRACT_ADDRESS=${address}\n`;
  fs.appendFileSync(envPath, envLine);
  console.log("\n✅ Contract address written to .env → VITE_CONTRACT_ADDRESS");
  console.log("   Run `npm run dev` to start the app with the live contract.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
