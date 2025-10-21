import { createPublicClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { toSafeSmartAccount, SafeVersion } from "permissionless/accounts";
import { ethers } from "ethers";

const PaymasterMode = { SPONSORED: "SPONSORED" };

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

async function getSmartAccountClient(privateKey: string) {
  const client = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: { address: "0x0000000000000000000000000000000000000000", version: "v0.7" as any },
    })
  );

  const signerAccount = privateKeyToAccount(privateKey as `0x${string}`);

  const smartAccount = await toSafeSmartAccount({
    client,
    owners: [signerAccount],
    version: SafeVersion.V070,
  });

  return await createSmartAccountClient({
    chain: monadTestnet,
    account: smartAccount,
    transport: http(RPC_URL),
    paymaster: { mode: PaymasterMode.SPONSORED },
  });
}

export async function saveScoreSmart(userPrivateKey: string, score: number) {
  const smartAccount = await getSmartAccountClient(userPrivateKey);
  const iface = new ethers.Interface(ABI);
  const data = iface.encodeFunctionData("saveScore", [score]);
  const tx = { to: CONTRACT_ADDRESS as `0x${string}`, data, value: parseEther("0") };
  const userOpHash = await smartAccount.sendUserOperation({ calls: [tx] });
  console.log("🚀 UserOp Hash:", userOpHash);
  return userOpHash;
}

export async function getScore(player: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const score = await contract.getScore(player);
  console.log("🎮 Score fetched:", Number(score));
  return Number(score);
}
