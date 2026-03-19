export const NETWORKS = {
  celoSepolia: {
    chainId: "0xaa36a7",
    chainName: "Celo Sepolia",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: ["https://celo-sepolia.g.alchemy.com/v2/demo"],
    blockExplorerUrls: ["https://celo-sepolia.blockscout.com"],
  },
};

export const ACTIVE_NETWORK = NETWORKS.celoSepolia;

export const ACTIVE_USDT = "0x0000000000000000000000000000000000000000";

export const CELOCRUSH_CONTRACT_ADDRESS = 
  import.meta.env.VITE_CONTRACT_ADDRESS || "";
