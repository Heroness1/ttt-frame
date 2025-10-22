import { createDelegation } from "@metamask/delegation-toolkit";

/**
 * Inisialisasi delegation untuk player (MetaMask Delegation Toolkit)
 * Compatible dengan @metamask/delegation-toolkit@0.13.0
 * 
 * @param wallet - address EOA user (0x...)
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // ✅ Buat delegation sederhana (tanpa expiry/permissions)
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      caveats: [], // opsional: bisa ditambah batasan fungsi di sini
    });

    console.log("🪶 Delegation created successfully:", delegation);
    return delegation;
  } catch (err) {
    console.error("❌ Failed to create delegation:", err);
    throw err;
  }
}