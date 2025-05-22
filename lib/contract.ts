import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./constant";

const rpcUrl = process.env.MONAD_RPC_URL!;
const privateKey = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

export async function setScore(score: number) {
  const tx = await contract.setScore(score);
  await tx.wait();
}

export async function getScore(userAddress: string) {
  const score = await contract.getScore(userAddress);
  return score;
}

export { wallet };