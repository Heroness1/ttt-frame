// lib/constants.ts

export const APP_URL = "https://ttt-frame.vercel.app";

export const CONTRACT_ADDRESS = "0xBB0a4d0D30bF632D8fDA4540724840a2E9b595AF";

export const ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getScore",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "scores",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "score",
        type: "uint256",
      },
    ],
    name: "setScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];