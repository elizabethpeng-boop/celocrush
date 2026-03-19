import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CELOCRUSH_ABI, USDT_ABI } from "../lib/abi.js";
import { ACTIVE_USDT, CELOCRUSH_CONTRACT_ADDRESS } from "../lib/networks.js";
import { saveMessage, loadMessage, hashMessage } from "../lib/storage.js";

const USDT_DECIMALS = 6; // USDT on Celo uses 6 decimals

/**
 * useCeloCrush
 * All on-chain interactions with the CeloCrush smart contract.
 */
export function useCeloCrush({ signer, provider, address }) {
  const [txPending, setTxPending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = CELOCRUSH_CONTRACT_ADDRESS;

  // ── Get contract instances
  const getContract = useCallback(() => {
    if (!signer || !contractAddress) throw new Error("Wallet not connected or contract not deployed.");
    return new ethers.Contract(contractAddress, CELOCRUSH_ABI, signer);
  }, [signer, contractAddress]);

  const getUSDT = useCallback(() => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(ACTIVE_USDT, USDT_ABI, signer);
  }, [signer]);

  // ── USDT balance
  const getUSDTBalance = useCallback(async () => {
    if (!provider || !address) return "0";
    const usdt    = new ethers.Contract(ACTIVE_USDT, USDT_ABI, provider);
    const balance = await usdt.balanceOf(address);
    return ethers.formatUnits(balance, USDT_DECIMALS);
  }, [provider, address]);

  // ─────────────────────────────────────────────────────────────────────────
  // SEND A CRUSH
  // ─────────────────────────────────────────────────────────────────────────
  const sendCrush = useCallback(async ({ recipientAddress, message, tipUSDT }) => {
    setTxPending(true);
    setError(null);
    try {
      const contract   = getContract();
      const usdt       = getUSDT();
      const tipAmount  = ethers.parseUnits(tipUSDT || "0", USDT_DECIMALS);
      const msgHash    = hashMessage(message); // keccak256 of plaintext

      // 1. If there's a tip, approve USDT spend first
      if (tipAmount > 0n) {
        const approveTx = await usdt.approve(contractAddress, tipAmount);
        await approveTx.wait();
      }

      // 2. Send the crush on-chain
      const tx = await contract.sendCrush(recipientAddress, msgHash, tipAmount);
      const receipt = await tx.wait();
      setLastTxHash(receipt.hash);

      // 3. Parse the crushId from the CrushSent event
      const iface   = new ethers.Interface(CELOCRUSH_ABI);
      const log     = receipt.logs.find(l => {
        try { iface.parseLog(l); return true; } catch { return false; }
      });
      const parsed  = log ? iface.parseLog(log) : null;
      const crushId = parsed?.args?.crushId?.toString() ?? receipt.hash.slice(0, 8);

      // 4. Store the encrypted message off-chain (localStorage for demo, IPFS for prod)
      await saveMessage({ crushId, plaintext: message, recipientAddress });

      return { crushId, txHash: receipt.hash };
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || "Transaction failed";
      setError(msg);
      throw e;
    } finally {
      setTxPending(false);
    }
  }, [getContract, getUSDT, contractAddress]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLAIM A TIP
  // ─────────────────────────────────────────────────────────────────────────
  const claimTip = useCallback(async (crushId) => {
    setTxPending(true);
    setError(null);
    try {
      const contract = getContract();
      const tx       = await contract.claimTip(crushId);
      const receipt  = await tx.wait();
      setLastTxHash(receipt.hash);
      return receipt.hash;
    } catch (e) {
      const msg = e?.reason || e?.shortMessage || e?.message || "Claim failed";
      setError(msg);
      throw e;
    } finally {
      setTxPending(false);
    }
  }, [getContract]);

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD INBOX
  // ─────────────────────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    if (!provider || !address || !contractAddress) return [];
    try {
      const contract = new ethers.Contract(contractAddress, CELOCRUSH_ABI, provider);

      // Get all crush IDs for this address
      const crushIds = await contract.getInbox(address);

      // Fetch each crush's on-chain data
      const crushData = await Promise.all(
        crushIds.map(async (id) => {
          const crush = await contract.getCrush(id);
          const message = await loadMessage({
            crushId: id.toString(),
            recipientAddress: address,
          });
          return {
            id:        id.toString(),
            message:   message || "✨ A kind thought was sent your way.",
            tip:       ethers.formatUnits(crush.tipAmount, USDT_DECIMALS),
            claimed:   crush.claimed,
            refunded:  crush.refunded,
            expiresAt: Number(crush.expiresAt),
            timestamp: formatTimestamp(Number(crush.expiresAt) - 30 * 86400),
          };
        })
      );

      // Newest first
      return crushData.reverse();
    } catch (e) {
      console.error("Failed to load inbox:", e);
      return [];
    }
  }, [provider, address, contractAddress]);

  return {
    sendCrush,
    claimTip,
    loadInbox,
    getUSDTBalance,
    txPending,
    lastTxHash,
    error,
    contractDeployed: !!contractAddress,
  };
}

function formatTimestamp(unixSeconds) {
  const diff = Math.floor(Date.now() / 1000) - unixSeconds;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
