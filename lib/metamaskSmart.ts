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

  // Correct usage: Pass Pimlico config object to pimlicoActions
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: "0x0000000000000000000000000000000000000000", // Replace with actual EntryPoint address
        version: "0.7" as any,
      },
    })
  );

  // Create the smart account client with bundlerTransport
  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: eoa as `0x${string}`,
      // signTransaction must return serialized transaction hex string
      signTransaction: async (tx) => {
        const serialized = serializeTransaction(tx);
        return serialized;
      },
      signMessage: async (msg) => msg,
    },
    bundlerTransport: http(RPC_URL),
    paymaster: { mode: PaymasterMode.SPONSORED },
  });

  console.log("🧠 Smart Account ready:", smartAccountClient);
  return eoa;
}
