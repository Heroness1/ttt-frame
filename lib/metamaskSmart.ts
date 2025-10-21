import { MetaMaskSDK } from "@metamask/sdk";
import { createSmartAccountClient, PaymasterMode } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const BUNDLER_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PAYMASTER_URL = `https://api.pimlico.io/v2/monad-testnet/paymaster?apikey=${PIMLICO_API_KEY}`;

let sdk: MetaMaskSDK | null = null;

export async function connectSmartAccount() {
  if (!sdk) {
    sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "TetraMON",
        url: window.location.href,
      },
    });
  }

  const ethereum = sdk.getProvider();
  if (!ethereum) throw new Error("MetaMask not available");

  const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const eoa = accounts[0];

  console.log("🔗 Connected EOA:", eoa);

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(BUNDLER_URL),
  }).extend(pimlicoBundlerActions(BUNDLER_URL));

  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: eoa as `0x${string}`,
      signTransaction: async (tx) => tx, // Simplified for SDK usage
      signMessage: async (msg) => msg,
    },
    transport: http(BUNDLER_URL),
    sponsorUserOperation: pimlicoPaymasterActions(PAYMASTER_URL),
    paymaster: {
      mode: PaymasterMode.SPONSORED,
    },
  });

  console.log("🧠 Smart Account ready:", smartAccountClient);
  return eoa;
}
