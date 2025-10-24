import { createDelegation, DeleGatorEnvironment } from "@metamask/delegation-toolkit";


export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // ✅ Create delegation dengan enum environment (pakai SDK terbaru)
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment: DeleGatorEnvironment.Production, // ✅ versi fix!
      scope: "tetramon_game_score",
      caveats: [],
    });

    console.log("🪶 Delegation created successfully:", delegation);
    return delegation;
  } catch (err) {
    console.error("❌ Failed to create delegation:", err);
    throw err;
  }
}
