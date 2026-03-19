jsexport const NETWORKS = {
  celoSepolia: {
    chainId: "0xaa37dc",
    chainName: "Celo Sepolia",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
    blockExplorerUrls: ["https://celo-sepolia.blockscout.com"],
  },
};

export const ACTIVE_NETWORK = NETWORKS.celoSepolia;

export const ACTIVE_USDT = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export const CELOCRUSH_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || "";