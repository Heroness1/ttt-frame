import { createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { toSafeSmartAccount } from "permissionless/accounts";
import { ethers } from "ethers";

// ✅ Manual enum fallback (karena PaymasterMode deprecated)
const PaymasterMode = { SPONSORED: "SPONSORED" };

// 🧩 Environment variables
const CONTRACT_ADDRESS = "0xb6F7A3e43F2B22e5f73162c29a12c280A8c20db2";
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

// 🔹 ABI kontrak
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

// 🧠 Membuat Smart Account client yang valid
async function getSmartAccountClient(signerPrivateKey: string) {
  // Buat Viem client + extend dengan Pimlico bundler
  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: "0x0000000000000000000000000000000000000000",
        version: "v0.7" as any,
      },
    })
  );

  // ✅ Buat owner valid (Account Viem)
  const signerAccount = privateKeyToAccount(signerPrivateKey as `0x${string}`);

  // ✅ Buat smart account via Safe model
  const smartAccount = await toSafeSmartAccount({
    client,
    owners: [signerAccount],
  });

  // ✅ Create Smart Account Client ready to send userOps
  return await createSmartAccountClient({
    chain: monadTestnet,
    account: smartAccount,
    client,
    transport: http(RPC_URL),
    paymaster: {
      mode: PaymasterMode.SPONSORED,
    },
  });
}

// 💾 Fungsi untuk menyimpan skor (gasless)
export async function saveScoreSmart(score: number) {
  try {
    // Ambil private key owner dari env (bisa diganti kalau multi-user)
    const smartAccount = await getSmartAccountClient(OWNER_PRIVATE_KEY);

    const iface = new ethers.Interface(ABI);
    const data = iface.encodeFunctionData("saveScore", [score]);

    const tx = {
      to: CONTRACT_ADDRESS as `0x${string}`,
      data,
      value: parseEther("0"),
    };

    // 🔥 Kirim sebagai user operation (gasless)
    const userOpHash = await smartAccount.sendUserOperation({
      calls: [tx],
    });

    console.log("🚀 UserOp Hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.error("❌ Failed to save score via smart account:", err);
    throw err;
  }
}

// 📊 Fungsi untuk membaca skor (read-only)
export async function getScore(player: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const score = await contract.getScore(player);
  console.log("🎮 Score fetched:", Number(score));
  return Number(score);
}
