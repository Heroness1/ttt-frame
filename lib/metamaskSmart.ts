import { MetaMaskSDK } from "@metamask/sdk";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, http, serializeTransaction } from "viem";
import { monadTestnet } from "viem/chains";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

// fallback manual because PaymasterMode removed
const PaymasterMode = { SPONSORED: "SPONSORED" };

let sdk: MetaMaskSDK | null = null;

export async function connectSmartAccount() {
  if (!sdk) {
    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "TetraMON",
        url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }

  const ethereum = sdk.getProvider();
  if (!ethereum) throw new Error("MetaMask not available");

  const accounts = (await ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  const eoa = accounts[0];
  console.log("🔗 Connected EOA:", eoa);

  // Create publicClient with proper pimlicoActions config object
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: "0x0000000000000000000000000000000000000000", // Replace with actual entry point address
        version: "0.7" as any,
      },
    })
  );

  // Create smart account client passing serialization for transactions and proper signMessage
  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: eoa as `0x${string}`,
      signTransaction: async (tx) => {
        const serialized = serializeTransaction(tx);
        return serialized; // Returns hex string serialized transaction
      },
      signMessage: async (message) => {
        // Use MetaMask provider personal_sign method to sign message
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [message, eoa],
        });
        return signature as string; // Hex signature string starting with 0x
      },
    },
    bundlerTransport: http(RPC_URL),
    paymaster: { mode: PaymasterMode.SPONSORED },
  });

  console.log("🧠 Smart Account ready:", smartAccountClient);
  return eoa;
}
