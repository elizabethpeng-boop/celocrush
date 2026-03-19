# 💌 CeloCrush

> Anonymous verified compliments + USDT tips. Built on Celo Sepolia with Self zkID. Opera MiniPay Mini App.

## Project structure

```
celocrush/
├── src/
│   ├── CeloCrush.jsx          ← Full React app (all 6 screens)
│   ├── main.jsx
│   ├── hooks/
│   │   ├── useWallet.js       ← MiniPay/MetaMask wallet + network switching
│   │   ├── useCeloCrush.js    ← ethers.js: sendCrush, claimTip, loadInbox
│   │   └── useSelfZkID.js     ← Self zkID verification (mock → real SDK)
│   └── lib/
│       ├── networks.js        ← Celo Sepolia + Mainnet config
│       ├── abi.js             ← CeloCrush + USDT ABIs
│       └── storage.js         ← Encrypted message storage (localStorage → IPFS)
├── contracts/
│   └── CeloCrush.sol          ← Solidity escrow (sendCrush, claimTip, refund)
├── scripts/
│   └── deploy.js              ← Hardhat deploy → auto-writes address to .env
├── hardhat.config.js          ← Celo Sepolia + Mainnet network config
├── vite.config.js
└── .env.example
```

## Quickstart

```bash
npm install
cp .env.example .env        # add your DEPLOYER_PRIVATE_KEY
npm run deploy              # deploys to Celo Sepolia, writes address to .env
npm run dev                 # start app at localhost:5173
```

Get testnet CELO: https://faucet.celo.org/alfajores

## Self zkID — go live

In `src/hooks/useSelfZkID.js`, replace the demo simulation block with:

```js
import { SelfAppBuilder } from "@selfxyz/core";

const selfApp = new SelfAppBuilder({
  appName:     "CeloCrush",
  scope:       "celocrush-verify",
  endpoint:    "https://your-backend/api/verify",
  userId:      userAddress,
  disclosures: { minimumAge: 18 },
  devMode:     true,
}).build();

setQrData(selfApp.getQRCodeData());
selfApp.on("proof", (proof) => { setStatus("verified"); onVerified({ proof }); });
```

Docs: https://docs.self.xyz

## Upgrade to IPFS storage

In `src/lib/storage.js`, replace the `saveMessage` body with web3.storage:

```js
const cid = await client.put([new File([JSON.stringify({encrypted})], "crush.json")]);
return { hash, cid };
```

## Network config

| | Chain ID | RPC | Explorer |
|---|---|---|---|
| Celo Sepolia | 44787 | alfajores-forno.celo-testnet.org | alfajores.celoscan.io |
| Celo Mainnet | 42220 | forno.celo.org | celoscan.io |

Switch in `src/lib/networks.js` → `ACTIVE_NETWORK`.

## Contract functions

| Function | Caller | Action |
|---|---|---|
| `sendCrush(recipient, msgHash, tip)` | Sender | Creates crush, escrows USDT |
| `claimTip(crushId)` | Recipient | Receives USDT (2.5% fee) |
| `refund(crushId)` | Sender | Refund after 30 days if unclaimed |
| `getInbox(address)` | Frontend | List of crushIds |
| `getCrush(crushId)` | Frontend | Full crush data |

## Verify on Celoscan

```bash
npx hardhat verify --network celoSepolia 0xYOUR_ADDRESS \
  "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
```
