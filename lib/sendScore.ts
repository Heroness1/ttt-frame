import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";
import { normalizeAddress } from "./utils";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;

/**
 * Kirim skor ke Monad testnet via Pimlico (AA) dengan fallback ke EOA
 */
export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet) throw new Error("⚠️ Wallet not connected!");
    const safeWallet = normalizeAddress(wallet);
    console.log("🎮 Preparing to send score:", safeWallet, "→", scoreValue);

    // 1️⃣ Encode data
    const data = encodeFunctionData({
      abi: TETRA_SCORE_ABI,
      functionName: "saveScore",
      args: [safeWallet as `0x${string}`, BigInt(scoreValue)],
    });

    // 2️⃣ Smart Account Mode (try)
    try {
      console.log("⚙️ Trying Smart Account (Pimlico)...");
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

      const smartAccount = await createSmartAccountClient({
        chain: monadTestnet,
        account: {
          address: safeWallet as `0x${string}`,
          signTransaction: async () => "0x" + "0".repeat(64),
          signMessage: async () => "0x" + "0".repeat(64),
        },
        bundlerTransport: http(RPC_URL),
        paymaster: {
          getPaymasterData: async () => ({ paymasterAndData: "0x" }),
        },
      });

      const userOpHash = await smartAccount.sendUserOperation({
        calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
      });

      console.log("✅ Smart Account success:", userOpHash);
      return userOpHash;
    } catch (aaError) {
      console.warn("⚠️ Smart Account failed → fallback to EOA:", aaError);
    }

    // 3️⃣ Fallback ke EOA (direct send)
    if (!PRIVATE_KEY) throw new Error("Missing NEXT_PUBLIC_TEST_PRIVATE_KEY");

    console.log("🔁 Switching to EOA mode...");
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http("https://rpc.monad-testnet.gelato.digital"),
    });

    const txHash = await walletClient.sendTransaction({
      to: TETRA_SCORE_ADDRESS as `0x${string}`,
      data,
    });

    console.log("✅ EOA transaction sent:", txHash);
    return txHash;
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    throw err;
  }
}
