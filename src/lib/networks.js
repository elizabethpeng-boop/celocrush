/**
 * Celo Network Configuration
 * Testnet: Celo Sepolia  (user-confirmed name)
 * Mainnet: Celo Mainnet
 */

export const NETWORKS = {
  celoSepolia: {
    chainId: "0xaef3",          // 44787 decimal — Celo Sepolia / Alfajores
    chainName: "Celo Sepolia Testnet",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
    blockExplorerUrls: ["https://alfajores.celoscan.io"],
  },
  celoMainnet: {
    chainId: "0xa4ec",          // 42220 decimal
    chainName: "Celo",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://celoscan.io"],
  },
};

// Toggle this for production
export const ACTIVE_NETWORK = NETWORKS.celoSepolia;

/**
 * USDT contract addresses on Celo
 * Sepolia testnet uses a mock USDT you can mint for testing
 */
export const USDT_ADDRESS = {
  celoSepolia: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // cUSD on Alfajores (swap for real USDT once deployed)
  celoMainnet: "0x617f3112bf5397D0467D315cC709EF968D9ba546",
};

export const ACTIVE_USDT = USDT_ADDRESS.celoSepolia;

// Filled in after deployment — run `npm run deploy` to get this
export const CELOCRUSH_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
