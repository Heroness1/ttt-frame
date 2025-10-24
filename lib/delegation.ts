import { createDelegation, type DeleGatorEnvironment } from "@metamask/delegation-toolkit";

/**
 * 🪪 Init Delegation MetaMask (v0.13.0)
 * Fully compatible with TetraMON + Pimlico gasless
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // 🌐 Tentukan environment (auto detect)
    const envString =
      process.env.VERCEL_ENV === "production" ? "production" : "test";
    const environment = envString as unknown as DeleGatorEnvironment;

    // ⚙️ Buat delegation pakai SDK resmi
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment,
      scope: {
        id: "tetramon_game_score", // ✅ fix: pakai 'id' bukan 'namespace'
        permissions: ["sign", "execute"], // ✅ fix: pakai 'permissions'
      },
      caveats: [], // opsional
    });

    console.log("🪶 Delegation created successfully:", delegation);
    return delegation;
  } catch (err) {
    console.error("❌ Failed to create delegation:", err);
    throw err;
  }
}
