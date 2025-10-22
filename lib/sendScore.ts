import { createSmartAccountClient } from "permissionless";
import { pimlicoPaymasterClient } from "permissionless/actions/pimlico";
import { createPublicClient, encodeFunctionData, http, type SignableMessage } from "viem";
import { monadTestnet } from "viem/chains";
import { type LocalAccount } from "viem/accounts";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";
import { normalizeAddress } from "./utils";
import { initDelegationForPlayer } from "./delegation";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

/**
 * Save Tetris score to Monad testnet via Pimlico gasless transaction.
 * Uses Delegation Toolkit + Sponsored Paymaster.
 */
export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet) throw new Error("⚠️ Wallet not connected!");
    const safeWallet = normalizeAddress(wallet);
    console.log("🧠 Sending score for:", safeWallet, "value:", scoreValue);

    // 🪪 1️⃣ Delegation
    const delegation = await initDelegationForPlayer(wallet);

    // 🔗 2️⃣ Public Client
    const publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(RPC_URL),
    });

    // 🧩 3️⃣ Dummy Local Account (for Smart Account)
    const account: LocalAccount = {
      address: safeWallet as `0x${string}`,
      type: "local",
      source: ("0x" + "2".repeat(64)) as `0x${string}`,
      publicKey: ("0x" + "1".repeat(128)) as `0x${string}`,
      signTransaction: async () => ("0x" + "0".repeat(64)) as `0x${string}`,
      signMessage: async ({ message }: { message: SignableMessage }) =>
        ("0x" + "0".repeat(64)) as `0x${string}`,
      signTypedData: async () => ("0x" + "0".repeat(64)) as `0x${string}`,
    };

    // 💸 4️⃣ Smart Account Client (Sponsored by Pimlico)
    const smartAccount = await createSmartAccountClient({
      chain: monadTestnet,
      account,
      bundlerTransport: http(RPC_URL),
      paymaster: await pimlicoPaymasterClient({
        transport: http(RPC_URL),
        sponsor: true, // ✅ Enable Sponsored Gas
      }),
      delegation,
    });

    // 🎮 5️⃣ Encode saveScore() call
    const data = encodeFunctionData({
      abi: TETRA_SCORE_ABI,
      functionName: "saveScore",
      args: [safeWallet as `0x${string}`, BigInt(scoreValue)],
    });

    // 🚀 6️⃣ Send UserOperation
    const userOpHash = await smartAccount.sendUserOperation({
      calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
    });

    console.log(`✅ Score ${scoreValue} saved successfully!`);
    console.log("🔗 UserOp hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    throw err;
  }
}