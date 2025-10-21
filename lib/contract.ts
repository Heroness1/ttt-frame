import { createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { toSafeSmartAccount } from "permissionless/accounts";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xb6F7A3e43F2B22e5f73162c29a12c280A8c20db2";
const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

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

// multi-user (tiap user kirim private key unik dari UI atau env)
export async function getSmartAccountClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  })
    .extend(pimlicoBundlerActions())
    .extend(pimlicoPaymasterActions());

  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [account],
    version: "1.4.1" as any, // versi safe terbaru, gak bentrok
  });

  const smartClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: safeAccount,
    transport: http(RPC_URL),
    sponsorUserOperation: async ({ userOperation }) => {
      const paymasterData = await publicClient.getPaymasterData({
        userOperation,
        entryPoint: safeAccount.entryPoint,
      });
      return paymasterData;
    },
  });

  return smartClient;
}

export async function saveScoreSmart(privateKey: string, score: number) {
  try {
    const smartAccount = await getSmartAccountClient(privateKey);
    const iface = new ethers.Interface(ABI);
    const data = iface.encodeFunctionData("saveScore", [score]);

    const tx = {
      to: CONTRACT_ADDRESS as `0x${string}`,
      data,
      value: parseEther("0"),
    };

    const userOpHash = await smartAccount.sendUserOperation({
      calls: [tx],
    });

    console.log("✅ UserOp Hash:", userOpHash);
    return userOpHash;
  } catch (err) {
    console.error("❌ saveScoreSmart error:", err);
    throw err;
  }
}

export async function getScore(player: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const score = await contract.getScore(player);
  return Number(score);
}
