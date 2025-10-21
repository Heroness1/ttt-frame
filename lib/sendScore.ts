import { createSmartAccountClient } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { monadTestnet } from "viem/chains";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "../lib/tetrascore";

// 🔑 Environment
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PAYMASTER_URL = `https://api.pimlico.io/v2/monad-testnet/paymaster?apikey=${PIMLICO_API_KEY}`;
const PaymasterMode = { SPONSORED: "SPONSORED" };

// 
async function createMockDelegation(from, to) {
  return {
    from,
    to,
    validity: "7d",
    signature: "0x" + "f".repeat(130), // dummy EIP-712 signature
    timestamp: Date.now(),
  };
}

// 🚀 Fungsi utama
export async function sendScoreToChain(scoreValue, walletAddress) {
  try {
    if (!walletAddress) throw new Error("⚠️ Wallet address missing!");
    if (!scoreValue) throw new Error("⚠️ Invalid score value!");

    console.log(`🎯 Preparing to send score ${scoreValue} for ${walletAddress}`);

    // 🧩 Fake delegation (until SDK is public)
    const delegation = await createMockDelegation(walletAddress, walletAddress);
    console.log("✅ Delegation ready (mock):", delegation);

    // 🌐 Init client
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(RPC_URL),
    })
      .extend(pimlicoBundlerActions(RPC_URL))
      .extend(pimlicoPaymasterActions(PAYMASTER_URL));

    // 🧠 Buat smart account client
    const smartAccount = await createSmartAccountClient({
      chain: monadTestnet,
      account: {
        address: walletAddress,
        signTransaction: async (tx) => tx,
        signMessage: async (msg) => msg,
      },
      transport: http(RPC_URL),
      paymaster: { mode: PaymasterMode.SPONSORED },
      delegation, // ✅ future ready
    });

    // 🧬 Encode data ke contract
    const data = encodeFunctionData({
      abi: TETRA_SCORE_ABI,
      functionName: "saveScore",
      args: [walletAddress, BigInt(scoreValue)],
    });

    // ⚡ Kirim operasi (UserOp)
    const userOpHash = await smartAccount.sendUserOperation({
      calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
    });

    console.log("✅ Score submitted:", scoreValue, "UserOp Hash:", userOpHash);
    alert(`✅ Skor ${scoreValue} berhasil disimpan ke Monad Testnet!`);
  } catch (err) {
    console.error("❌ Gagal kirim score:", err);
    alert("⚠️ Gagal menyimpan skor ke blockchain. Lihat console log untuk detail.");
  }
}