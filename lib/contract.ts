import { createPublicClient, http, parseEther } from "viem";
import { monadTestnet } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico"; // ✅ FIXED
import { ethers } from "ethers";

// ✅ manual fallback for mode
const PaymasterMode = { SPONSORED: "SPONSORED" };

const CONTRACT_ADDRESS = "0xb6F7A3e43F2B22e5f73162c29a12c280A8c20db2";
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

// ABI kontrak
const ABI = [
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "saveScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// 🧠 Smart Account client via Pimlico
async function getSmartAccountClient(signerAddress: string) {
  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: "0x0000000000000000000000000000000000000000", // dummy safe address
        version: "v0.7", // ✅ EntryPoint versi baru
      },
    })
  );

  return await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: signerAddress as `0x${string}`,
      signTransaction: async (tx) => tx,
      signMessage: async (msg) => msg,
    },
    transport: http(RPC_URL),
    paymaster: {
      mode: PaymasterMode.SPONSORED, // ✅ tetap gasless
    },
  });
}

// 💾 Save score ke blockchain (gasless)
export async function saveScoreSmart(signerAddress: string, score: number) {
  try {
    const smartAccount = await getSmartAccountClient(signerAddress);

    const iface = new ethers.Interface(ABI);
    const data = iface.encodeFunctionData("saveScore", [score]);

    const tx = {
      to: CONTRACT_ADDRESS as `0x${string}`,
      data,
      value: parseEther("0"),
    };

    const userOp = await smartAccount.sendUserOperation({
      calls: [tx],
    });

    console.log("🚀 UserOp Hash:", userOp);
    return userOp;
  } catch (err) {
    console.error("❌ Failed to save score via smart account:", err);
    throw err;
  }
}

// 📊 Fetch score (read-only)
export async function getScore(player: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const score = await contract.getScore(player);
  console.log("🎮 Score fetched:", Number(score));
  return Number(score);
}
