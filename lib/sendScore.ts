import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, encodeFunctionData, http, type SignableMessage } from "viem";
import { monadTestnet } from "viem/chains";
import { type LocalAccount } from "viem/accounts";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";
import { normalizeAddress } from "./utils";
import { initDelegationForPlayer } from "./delegation"; // 🧠 NEW — real Delegation SDK integration

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet) throw new Error("⚠️ Wallet not connected!");
    const safeWallet = normalizeAddress(wallet);
    console.log("🧠 Sending score for:", safeWallet, "value:", scoreValue);

    // 🧩 1️⃣ Create a real delegation instance (via MetaMask Delegation Toolkit)
    const delegation = await initDelegationForPlayer(safeWallet);
    console.log("✅ Delegation created:", delegation);

    // 🧩 2️⃣ Client
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

    // 🧩 3️⃣ Dummy local account
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

    // 🧩 4️⃣ SmartAccount with simple paymaster
    const smartAccount = await createSmartAccountClient({
      chain: monadTestnet,
      account,
      bundlerTransport: http(RPC_URL),
      paymaster: {
        getPaymasterData: async () => ({
          paymasterAndData: "0x",
        }),
      },
    });

    // 🧩 5️⃣ Encode and send
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