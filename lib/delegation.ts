import { createDelegation, type DeleGatorEnvironment } from "@metamask/delegation-toolkit";

/**
 * 🪪 Init Delegation MetaMask (v0.13.0)
 * Compatible for TetraMON game + Pimlico gasless
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // 🌐 Environment detection
    const envString =
      process.env.VERCEL_ENV === "production" ? "production" : "test";
    const environment = envString as unknown as DeleGatorEnvironment;

    // ⚙️ Create delegation
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment,
      scope: {
        namespace: "tetramon_game_score", // ✅ FIX: sesuai ScopeConfig
        allowedActions: ["sign", "execute"], // optional
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
