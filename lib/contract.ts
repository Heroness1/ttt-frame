import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constant";

const rpcUrl = process.env.MONAD_RPC_URL!;
const privateKey = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

export const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);