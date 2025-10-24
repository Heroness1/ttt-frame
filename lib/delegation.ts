import { createDelegation, type DeleGatorEnvironment } from "@metamask/delegation-toolkit";

/**
 * 🪪 Inisialisasi delegation untuk player (MetaMask Delegation Toolkit)
 * Compatible dengan @metamask/delegation-toolkit@0.13.0
 * 
 * @param wallet - address EOA user (0x...)
 * @returns delegation object siap dipakai di Smart Account / Pimlico flow
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address format");
    const safeWallet = wallet as `0x${string}`;

    // 🌐 Auto detect environment dari Vercel atau fallback ke local
    const environment =
      process.env.VERCEL_ENV === "production"
        ? ("production" as DeleGatorEnvironment)
        : ("test" as DeleGatorEnvironment);

    // ⚙️ Buat delegation MetaMask
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment,
      scope: "tetramon_game_score", // unik untuk game lo
      caveats: [], // opsional
    });

    console.log("🪶 Delegation created successfully:", delegation);
    console.log("🌍 Environment:", environment);

    return delegation;
  } catch (err) {
    console.error("❌ Failed to create delegation:", err);
    throw err;
  }
}
