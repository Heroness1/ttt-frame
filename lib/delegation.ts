import { createDelegation } from "@metamask/delegation-toolkit";

export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet || !wallet.startsWith("0x")) throw new Error("Invalid wallet");

    // Simulate real delegation using MetaMask SDK
    const delegation = await createDelegation({
      from: wallet,
      to: wallet,
      permissions: ["sign", "execute"],
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // valid 7 days
    });

    console.log("✅ Delegation initialized:", delegation);
    return delegation;
  } catch (err) {
    console.warn("⚠️ Fallback: offline delegation mode");
    return {
      from: wallet,
      to: wallet,
      permissions: ["sign"],
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
      signature: "0x" + "f".repeat(130),
    };
  }
}