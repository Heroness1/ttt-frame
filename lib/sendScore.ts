import {
  createSmartAccountClient,
  createPublicClient,
  encodeFunctionData,
  http,
  createWalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";
import { normalizeAddress } from "./utils";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY;

// Dummy delegation (sementara, biar AA gak error)
const delegation = {
  from: "0x0000000000000000000000000000000000000000",
  to: "0x0000000000000000000000000000000000000000",
  validity: "7d",
  signature: "0x" + "f".repeat(130),
  timestamp: Date.now(),
};

export async function sendScoreToChain(wallet: string, scoreValue: number) {
  if (!wallet) throw new Error("⚠️ Wallet not connected!");
  const safeWallet = normalizeAddress(wallet);
  console.log("🎮 Sending score for:", safeWallet, "→", scoreValue);

  // --- encode data for both modes ---
  const data = encodeFunctionData({
    abi: TETRA_SCORE_ABI,
    functionName: "saveScore",
    args: [safeWallet as `0x${string}`, BigInt(scoreValue)],
  });

  // --- try SMART ACCOUNT (AA) first ---
  try {
    console.log("⚙️ Trying Smart Account mode (Pimlico)...");
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
      delegation,
    });

    const userOpHash = await smartAccount.sendUserOperation({
      calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
    });

    console.log("✅ Smart Account success! UserOp Hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.warn("⚠️ Smart Account failed, falling back to EOA mode:", err);
  }

  // --- fallback: EOA direct send ---
  try {
    console.log("🔁 Switching to EOA mode...");
    if (!PRIVATE_KEY) throw new Error("Missing NEXT_PUBLIC_TEST_PRIVATE_KEY");

    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

    const client = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http("https://rpc.monad-testnet.gelato.digital"),
    });

    const txHash = await client.sendTransaction({
      to: TETRA_SCORE_ADDRESS as `0x${string}`,
      data,
    });

    console.log("✅ EOA Transaction sent:", txHash);
    return txHash;
  } catch (err) {
    console.error("❌ Both Smart Account & EOA failed:", err);
    throw err;
  }
}
