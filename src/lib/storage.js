import { ethers } from "ethers";

/**
 * Message Storage Layer
 *
 * Strategy:
 *  - Messages are encrypted client-side using the recipient's public key
 *  - The encrypted payload is stored in localStorage (demo) or an IPFS node (production)
 *  - Only the keccak256 hash of the plaintext goes on-chain
 *
 * Production upgrade path:
 *  Replace saveMessage / loadMessage with IPFS calls (e.g. web3.storage or nft.storage)
 *  and use Lit Protocol for on-chain access control decryption.
 */

const STORAGE_KEY = "celocrush_messages";

// ── Simple XOR-based obfuscation for demo (not real encryption)
// For production, replace with: https://docs.lit-protocol.xyz
function obfuscate(text, key) {
  const keyBytes = ethers.toUtf8Bytes(key.slice(2, 34)); // 32 bytes from address
  const textBytes = ethers.toUtf8Bytes(text);
  const out = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    out[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return ethers.hexlify(out);
}

function deobfuscate(hex, key) {
  const keyBytes = ethers.toUtf8Bytes(key.slice(2, 34));
  const hexBytes = ethers.getBytes(hex);
  const out = new Uint8Array(hexBytes.length);
  for (let i = 0; i < hexBytes.length; i++) {
    out[i] = hexBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return ethers.toUtf8String(out);
}

// ── Compute the on-chain hash for a plaintext message
export function hashMessage(plaintext) {
  return ethers.keccak256(ethers.toUtf8Bytes(plaintext));
}

// ── Save a message (encrypted for recipient)
export async function saveMessage({ crushId, plaintext, recipientAddress }) {
  const encrypted = obfuscate(plaintext, recipientAddress.toLowerCase());
  const hash      = hashMessage(plaintext);

  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  store[crushId] = { encrypted, recipientAddress: recipientAddress.toLowerCase() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

  return { hash, encrypted };
}

// ── Load and decrypt a message for the connected wallet
export async function loadMessage({ crushId, recipientAddress }) {
  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const entry = store[crushId];
  if (!entry) return null;

  try {
    const plaintext = deobfuscate(entry.encrypted, recipientAddress.toLowerCase());
    return plaintext;
  } catch {
    return "[Message could not be decrypted]";
  }
}

// ── Load all messages in the inbox for a given address
export async function loadInboxMessages(crushIds, recipientAddress) {
  const results = {};
  for (const id of crushIds) {
    results[id] = await loadMessage({ crushId: id.toString(), recipientAddress });
  }
  return results;
}

/**
 * IPFS UPGRADE — swap saveMessage body with:
 *
 * import { Web3Storage } from 'web3.storage';
 * const client = new Web3Storage({ token: import.meta.env.VITE_WEB3_STORAGE_TOKEN });
 *
 * const blob = new Blob([JSON.stringify({ encrypted })], { type: 'application/json' });
 * const cid  = await client.put([new File([blob], 'crush.json')]);
 * return { hash, cid };
 */
