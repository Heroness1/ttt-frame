import { MetaMaskSDK } from "@metamask/sdk";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import { createPublicClient, http, serializeTransaction, custom } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const ENTRYPOINT_ADDRESS = "0x0000000000000000000000000000000000000000";

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

  // Buat Viem client yang terhubung ke MetaMask
  const metamaskClient = createPublicClient({
    chain: monadTestnet,
    transport: custom(ethereum),
  });

  // Bikin Pimlico bundler client
  const pimlicoClient = createPublicClient({
    chain: monadTestnet,
    transport: http(RPC_URL),
  }).extend(
    pimlicoActions({
      entryPoint: {
        address: ENTRYPOINT_ADDRESS,
        version: "0.7" as any,
      },
    })
  );

  // Bentuk Smart Account Client dari MetaMask EOA
  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: eoa as `0x${string}`,
      signTransaction: async (tx) => {
        const serialized = serializeTransaction(tx);
        return serialized as `0x${string}`;
      },
      signMessage: async ({ message }) => {
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [message, eoa],
        });
        return signature as `0x${string}`;
      },
    } as any, // ✅ bypass TS strict checking safely
    client: pimlicoClient,
    paymaster: { mode: PaymasterMode.SPONSORED },
  });

  console.log("🧠 Smart Account ready:", smartAccountClient);
  return eoa;
}
