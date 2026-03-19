import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ACTIVE_NETWORK } from "../lib/networks.js";

/**
 * useWallet
 * Handles MiniPay (Opera) and MetaMask wallet connection.
 * Auto-switches to Celo Sepolia if on the wrong network.
 */
export function useWallet() {
  const [provider, setProvider]     = useState(null);
  const [signer, setSigner]         = useState(null);
  const [address, setAddress]       = useState(null);
  const [chainId, setChainId]       = useState(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError]           = useState(null);
  const [isMiniPay, setIsMiniPay]   = useState(false);

  const targetChainId = parseInt(ACTIVE_NETWORK.chainId, 16);

  // ── Detect MiniPay vs MetaMask
  useEffect(() => {
    if (window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }
  }, []);

  // ── Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No wallet found. Please open in Opera MiniPay.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer  = await web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();
      const network     = await web3Provider.getNetwork();
      const cId         = Number(network.chainId);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(userAddress);
      setChainId(cId);
      setIsCorrectChain(cId === targetChainId);
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, [targetChainId]);

  // ── Switch to Celo Sepolia
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ACTIVE_NETWORK.chainId }],
      });
    } catch (switchError) {
      // Chain not added yet — add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ACTIVE_NETWORK],
        });
      }
    }
    // Re-connect after switch
    await connect();
  }, [connect]);

  // ── Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = () => connect();
    const onChainChanged    = () => connect();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged",    onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged",    onChainChanged);
    };
  }, [connect]);

  // ── Auto-connect if MiniPay (it injects accounts automatically)
  useEffect(() => {
    if (window.ethereum?.isMiniPay) connect();
  }, [connect]);

  return {
    provider,
    signer,
    address,
    chainId,
    isCorrectChain,
    connecting,
    error,
    isMiniPay,
    connect,
    switchNetwork,
  };
}
