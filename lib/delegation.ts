import { createDelegation } from "@metamask/delegation-toolkit";

/**
 * Initialize delegation data for a player's wallet
 * Used to simulate EIP-7702 style delegation (meta auth)
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    // 🔒 Ensure proper 0x format
    const safeWallet = wallet.startsWith("0x") ? wallet : `0x${wallet}`;

    // 🧩 Create delegation object
    const delegation = await createDelegation({
      from: safeWallet as `0x${string}`,
      to: safeWallet as `0x${string}`,
      permissions: ["sign", "execute"],
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // valid for 7 days
    });

    console.log("🧾 Delegation created:", delegation);
    return delegation;
  } catch (error) {
    console.warn("⚠️ Delegation creation failed, using dummy:", error);
    // fallback dummy delegation
    return {
      from: wallet,
      to: wallet,
      validity: "7d",
      signature: "0x" + "f".repeat(130),
      timestamp: Date.now(),
    };
  }
}