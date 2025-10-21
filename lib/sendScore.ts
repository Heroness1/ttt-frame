import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, encodeFunctionData, http, type SignableMessage } from "viem";
import { monadTestnet } from "viem/chains";
import { type LocalAccount } from "viem/accounts";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";
import { normalizeAddress } from "./utils";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PaymasterMode = { SPONSORED: "SPONSORED" };

export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet) throw new Error("⚠️ Wallet not connected!");
    const safeWallet = normalizeAddress(wallet);
    console.log("🧠 Sending score for:", safeWallet, "value:", scoreValue);

    const delegation = {
      from: safeWallet,
      to: safeWallet,
      validity: "7d",
      signature: "0x" + "f".repeat(130),
      timestamp: Date.now(),
    };

    // 1️⃣ Client
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

    // 2️⃣ Dummy local account
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

    // 3️⃣ SmartAccount
    const smartAccount = await createSmartAccountClient({
      chain: monadTestnet,
      account,
      bundlerTransport: http(RPC_URL),
      paymaster: { mode: PaymasterMode.SPONSORED },
      delegation,
    });

    // 4️⃣ Encode dan kirim
    const data = encodeFunctionData({
      abi: TETRA_SCORE_ABI,
      functionName: "saveScore",
      args: [safeWallet as `0x${string}`, BigInt(scoreValue)],
    });

    const userOpHash = await smartAccount.sendUserOperation({
      calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
    });

    console.log(`✅ Score ${scoreValue} saved to chain!`);
    console.log("🔗 Hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    throw err;
  }
}
