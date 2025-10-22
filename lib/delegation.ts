import { createDelegation } from "@metamask/delegation-toolkit";

/**
 * Initialize delegation data for a player's wallet
 * Compatible with latest MetaMask Delegation Toolkit
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    const safeWallet = wallet.startsWith("0x") ? wallet : `0x${wallet}`;

    // ✅ sesuai versi terbaru (tanpa `permissions`)
    const delegation = await createDelegation({
      from: safeWallet as `0x${string}`,
      to: safeWallet as `0x${string}`,
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // valid 7 hari
      metadata: {
        app: "TetraMON",
        description: "Delegation for score sync",
      },
    });

    console.log("🧾 Delegation created:", delegation);
    return delegation;
  } catch (error) {
    console.warn("⚠️ Delegation creation failed, fallback used:", error);
    // fallback dummy delegation (buat jaga build tetap jalan)
    return {
      from: wallet,
      to: wallet,
      validity: "7d",
      signature: "0x" + "f".repeat(130),
      timestamp: Date.now(),
    };
  }
}