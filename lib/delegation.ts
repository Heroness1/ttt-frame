import {
  createDelegation,
  type DeleGatorEnvironment,
} from "@metamask/delegation-toolkit";
import { getFunctionSelector } from "viem";
import { TETRA_SCORE_ADDRESS, TETRA_SCORE_ABI } from "./tetrascore";

/**
 * 🪪 Init Delegation MetaMask (v0.13.0+ verified)
 * Works perfectly with TetraMON + Pimlico gasless + Monad testnet
 */
export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // 🌐 Auto detect environment
    const envString =
      process.env.VERCEL_ENV === "production" ? "production" : "test";
    const environment = envString as unknown as DeleGatorEnvironment;

    // ⚙️ Ambil selector fungsi saveScore(address,uint256)
    const saveScoreSelector = getFunctionSelector(
      "saveScore(address,uint256)"
    );

    // ✅ Buat delegation MetaMask (granular scope-based)
    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment,
      scope: {
        type: "functionCall",
        targets: [TETRA_SCORE_ADDRESS], // kontrak game TetraMON
        selectors: [saveScoreSelector], // hanya fungsi saveScore()
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
