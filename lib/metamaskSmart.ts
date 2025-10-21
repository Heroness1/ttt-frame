import { MetaMaskSDK } from "@metamask/sdk";

export const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Tetra",
    url: typeof window !== "undefined" ? window.location.href : "https://tetris-frame.vercel.app",
  },
  enableDebug: false,
  checkInstallationImmediately: false,
  preferDesktop: false,
  extensionOnly: false,
});

export async function connectSmartAccount() {
  const ethereum = MMSDK.getProvider();
  if (!ethereum) throw new Error("MetaMask provider not found");

  // 🧠 4337-mode login
  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
    params: [{ aa: true }], // enable Account Abstraction mode
  });
  return accounts[0];
}
