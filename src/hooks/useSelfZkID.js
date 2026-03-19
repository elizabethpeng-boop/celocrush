import { useState, useCallback, useRef } from "react";
import { ethers } from "ethers";

/**
 * useSelfZkID
 *
 * Integrates with Self Protocol for zero-knowledge identity verification.
 * Docs: https://docs.self.xyz
 *
 * Flow:
 *   1. App calls `startVerification(userAddress)`
 *   2. Self SDK generates a QR code / deep link
 *   3. User scans with Self mobile app
 *   4. Self calls back with a ZK proof
 *   5. We verify the proof on-chain via SelfVerificationRoot contract
 *
 * Install: npm install @selfxyz/core @selfxyz/qrcode
 */

// Self Protocol contract on Celo Sepolia
// Source: https://docs.self.xyz/developer-docs/contracts
const SELF_VERIFICATION_ADDRESS = "0x..."; // Fill from Self docs after deployment

export function useSelfZkID({ onVerified }) {
  const [status, setStatus]     = useState("idle"); // idle | pending | scanning | verified | error
  const [qrData, setQrData]     = useState(null);
  const [proof, setProof]        = useState(null);
  const [error, setError]        = useState(null);
  const listenerRef              = useRef(null);

  /**
   * Start the Self zkID verification flow.
   * In production, import SelfAppBuilder from @selfxyz/core.
   */
  const startVerification = useCallback(async (userAddress) => {
    setStatus("pending");
    setError(null);

    try {
      /**
       * ── PRODUCTION CODE (uncomment when @selfxyz/core is installed) ──
       *
       * import { SelfAppBuilder } from "@selfxyz/core";
       * import { SelfQRcodeWrapper } from "@selfxyz/qrcode";
       *
       * const selfApp = new SelfAppBuilder({
       *   appName:    "CeloCrush",
       *   scope:      "celocrush-verify",
       *   endpoint:   "https://your-backend.com/api/verify",  // or on-chain
       *   userId:     userAddress,
       *   disclosures: {
       *     minimumAge: 18,       // prove 18+ without revealing DOB
       *     // nationality: true, // optional
       *   },
       *   devMode: true,           // false on mainnet
       * }).build();
       *
       * // Get QR data to display
       * const qr = selfApp.getQRCodeData();
       * setQrData(qr);
       * setStatus("scanning");
       *
       * // Listen for proof callback
       * selfApp.on("proof", async (proofResult) => {
       *   setProof(proofResult);
       *   setStatus("verified");
       *   onVerified?.({ proof: proofResult, address: userAddress });
       * });
       *
       * selfApp.on("error", (err) => {
       *   setError(err.message);
       *   setStatus("error");
       * });
       */

      // ── DEMO SIMULATION (remove when SDK is wired up) ──
      setStatus("scanning");
      setQrData({ mock: true, address: userAddress });

      // Simulate the Self app scanning and returning a proof after 3.5s
      listenerRef.current = setTimeout(() => {
        const mockProof = {
          nullifierHash: ethers.keccak256(ethers.toUtf8Bytes(`mock-nullifier-${userAddress}`)),
          merkleRoot:    ethers.keccak256(ethers.toUtf8Bytes("mock-root")),
          address:       userAddress,
          disclosures:   { minimumAge: true },
          timestamp:     Date.now(),
        };
        setProof(mockProof);
        setStatus("verified");
        onVerified?.({ proof: mockProof, address: userAddress });
      }, 3500);

    } catch (e) {
      setError(e.message || "Verification failed");
      setStatus("error");
    }
  }, [onVerified]);

  const reset = useCallback(() => {
    if (listenerRef.current) clearTimeout(listenerRef.current);
    setStatus("idle");
    setQrData(null);
    setProof(null);
    setError(null);
  }, []);

  return { status, qrData, proof, error, startVerification, reset };
}
