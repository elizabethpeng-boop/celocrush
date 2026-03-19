export const CELOCRUSH_ABI = [
  // sendCrush
  {
    inputs: [
      { name: "recipient",   type: "address" },
      { name: "messageHash", type: "bytes32" },
      { name: "tipAmount",   type: "uint256" },
    ],
    name: "sendCrush",
    outputs: [{ name: "crushId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // claimTip
  {
    inputs: [{ name: "crushId", type: "uint256" }],
    name: "claimTip",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // refund
  {
    inputs: [{ name: "crushId", type: "uint256" }],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // getInbox
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getInbox",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  // getCrush
  {
    inputs: [{ name: "crushId", type: "uint256" }],
    name: "getCrush",
    outputs: [
      {
        components: [
          { name: "sender",      type: "address" },
          { name: "recipient",   type: "address" },
          { name: "messageHash", type: "bytes32" },
          { name: "tipAmount",   type: "uint256" },
          { name: "expiresAt",   type: "uint256" },
          { name: "claimed",     type: "bool"    },
          { name: "refunded",    type: "bool"    },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: "crushId",     type: "uint256" },
      { indexed: true,  name: "recipient",   type: "address" },
      { indexed: false, name: "messageHash", type: "bytes32" },
      { indexed: false, name: "tipAmount",   type: "uint256" },
      { indexed: false, name: "expiresAt",   type: "uint256" },
    ],
    name: "CrushSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: "crushId",   type: "uint256" },
      { indexed: true,  name: "recipient", type: "address" },
      { indexed: false, name: "amount",    type: "uint256" },
    ],
    name: "TipClaimed",
    type: "event",
  },
];

export const USDT_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];
