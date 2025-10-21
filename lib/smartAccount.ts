import { createSmartAccountClient } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { Address, createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const BUNDLER_URL = `https://api.pimlico.io/v1/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
const PAYMASTER_URL = `https://api.pimlico.io/v1/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;

// Initialize a public RPC client for Monad testnet
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(BUNDLER_URL),
});

// Create Paymaster client
export const paymasterClient = createPimlicoPaymasterClient({
  chain: monadTestnet,
  transport: http(PAYMASTER_URL),
});

// Main function to connect Smart Account (MetaMask SDK)
export async function connectSmartAccount() {
  if (typeof window === "undefined") throw new Error("No window detected");

  // Check MetaMask
  const { ethereum } = window as any;
  if (!ethereum) throw new Error("MetaMask not found");

  // Request wallet connection
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts[0] as Address;
  console.log("🔗 Wallet connected:", address);

  // Create Smart Account client (EIP-4337)
  const smartAccountClient = createSmartAccountClient({
    account: {
      address,
    },
    chain: monadTestnet,
    transport: http(BUNDLER_URL),
  })
    .extend(pimlicoBundlerActions)
    .extend(pimlicoPaymasterActions);

  console.log("✅ Smart Account ready via Pimlico");
  return { address, client: smartAccountClient };
}