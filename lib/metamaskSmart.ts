import { MetaMaskSDK } from "@metamask/sdk";
import { createSmartAccountClient } from "permissionless";
import { pimlicoActions } from "permissionless/actions/pimlico";
import {
  createPublicClient,
  http,
  serializeTransaction,
  custom,
  type TransactionSerializable,
} from "viem";
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

  const smartAccountClient = await createSmartAccountClient({
    chain: monadTestnet,
    account: {
      address: eoa as `0x${string}`,
      signTransaction: async (tx: TransactionSerializable) => {
        const serialized = serializeTransaction(tx);
        return serialized as `0x${string}`;
      },
      signMessage: async ({ message }: { message: string }) => {
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [message, eoa],
        });
        return signature as `0x${string}`;
      },
    } as any,
    client: pimlicoClient,
    paymaster: { mode: PaymasterMode.SPONSORED },
  });

  console.log("🧠 Smart Account ready:", smartAccountClient);
  return eoa;
}
