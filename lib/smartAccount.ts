import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const BUNDLER_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

const ENTRYPOINT_ADDRESS = "0x0000000000000000000000000000000000000000";

// 🛰️ Base public client (with Pimlico extensions)
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(BUNDLER_URL),
}).extend(
  pimlicoActions({
    entryPoint: {
      address: ENTRYPOINT_ADDRESS,
      version: "0.7" as any,
    },
  })
);

// ⚡ Connect Smart Account (MetaMask SDK)
export async function connectSmartAccount() {
  if (typeof window === "undefined") throw new Error("No window detected");

  const { ethereum } = window as any;
  if (!ethereum) throw new Error("MetaMask not found");

  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  const address = accounts[0] as `0x${string}`;
  console.log("🔗 Wallet connected:", address);

  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: { address } as any,
    client: publicClient,
    bundlerTransport: http(BUNDLER_URL),
    paymaster: {
      getPaymasterData: async () => ({
        paymaster: "0x0000000000000000000000000000000000000000",
        paymasterData: "0x",
      }),
    },
  });

  console.log("✅ Smart Account ready via Pimlico");
  return { address, client: smartAccountClient };
}
