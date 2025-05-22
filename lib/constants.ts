import { ethers } from "ethers";

const rpcUrl = process.env.MONAD_RPC_URL!;
const privateKey = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0xBB0a4d0D30bF632D8fDA4540724840a2E9b595AF";

const contractAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getScore",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "scores",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "setScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

async function setScore(score: number) {
  console.log("Submitting score:", score);

  const tx = await contract.setScore(score);
  await tx.wait();

  console.log("Score submitted successfully!");
}

async function getScore(userAddress: string) {
  const score = await contract.getScore(userAddress);
  console.log(`Score for ${userAddress}:`, score.toString());
  return score;
}

// Contoh pakai:
setScore(100).catch(console.error);
getScore(wallet.address).catch(console.error);