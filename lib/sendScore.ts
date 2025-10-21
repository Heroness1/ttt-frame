import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, encodeFunctionData, http } from "viem";
import { monadTestnet } from "viem/chains";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PaymasterMode = { SPONSORED: "SPONSORED" };

/**
 * Save Tetris score to Monad testnet via Pimlico gasless transaction.
 * @param wallet  address wallet pemain
 * @param scoreValue  nilai skor
 */
export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet) throw new Error("⚠️ Wallet not connected!");
    console.log("🧠 Preparing to send score to Monad:", scoreValue);

    // Dummy delegation (biar bisa jalan tanpa SDK tambahan)
    const delegation = {
      from: wallet,
      to: wallet,
      validity: "7d",
      signature: "0x" + "f".repeat(130),
      timestamp: Date.now(),
    };

    // 1️⃣ Setup Pimlico client
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(RPC_URL),
    }).extend(
      pimlicoActions({
        entryPoint: {
          address: "0x0000000000000000000000000000000000000000",
          version: "0.7",
        },
      })
    );

    // 2️⃣ Setup Smart Account
    const smartAccount = await createSmartAccountClient({
      chain: monadTestnet,
      account: {
        address: wallet,
        signTransaction: async (tx) => tx,
        signMessage: async (msg) => msg,
      },
      bundlerTransport: http(RPC_URL),
      paymaster: { mode: PaymasterMode.SPONSORED },
      delegation,
    });

    // 3️⃣ Encode function call
    const data = encodeFunctionData({
      abi: TETRA_SCORE_ABI,
      functionName: "saveScore",
      args: [wallet, BigInt(scoreValue)],
    });

    // 4️⃣ Send user operation
    const userOpHash = await smartAccount.sendUserOperation({
      calls: [
        {
          to: TETRA_SCORE_ADDRESS,
          data,
          value: 0n,
        },
      ],
    });

    console.log(`✅ Score ${scoreValue} sent successfully!`);
    console.log("🔗 UserOp hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    throw err;
  }
}