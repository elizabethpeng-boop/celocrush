require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },

  networks: {
    // ── Celo Sepolia Testnet (user-confirmed name for Celo testnet)
    celoSepolia: {
      url:      "https://forno.celo-sepolia.celo-testnet.org",
      chainId:  11142220,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: "auto",
    },
    // ── Celo Mainnet
    celoMainnet: {
      url:      "https://forno.celo.org",
      chainId:  42220,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: "auto",
    },
  },

  // Optional: verify contracts on Celoscan
  etherscan: {
    apiKey: {
      celoSepolia: process.env.CELOSCAN_API_KEY || "",
      celoMainnet: process.env.CELOSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celoMainnet",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
    ],
  },
};
