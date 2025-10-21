import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xb6F7A3e43F2B22e5f73162c29a12c280A8c20db2"; // ✅ ganti ke kontrak TetraScore lo
const ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "score", "type": "uint256" }],
    "name": "saveScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// 🧠 Provider untuk Monad Testnet (atau chain lain)
const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz";

// Inisialisasi provider dan kontrak
export async function getContract() {
  if (typeof window === "undefined") throw new Error("No window");

  // MetaMask Smart Account provider (dari MetaMask SDK)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ✅ Simpan skor ke blockchain
export async function setScore(score: number) {
  try {
    const contract = await getContract();
    const tx = await contract.saveScore(score);
    await tx.wait();
    console.log("✅ Score saved:", score);
    return true;
  } catch (err) {
    console.error("❌ Error saving score:", err);
    return false;
  }
}

// 📊 Ambil skor pemain
export async function getScore(address: string) {
  try {
    const contract = await getContract();
    const score = await contract.getScore(address);
    console.log("🎮 Score fetched:", Number(score));
    return Number(score);
  } catch (err) {
    console.error("❌ Error fetching score:", err);
    return 0;
  }
}