import {
  createDelegation,
  type DeleGatorEnvironment,
} from "@metamask/delegation-toolkit";
import { getFunctionSelector } from "viem";
import { TETRA_SCORE_ADDRESS } from "./tetrascore";

export async function initDelegationForPlayer(wallet: string) {
  try {
    if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
    const safeWallet = wallet as `0x${string}`;

    // Dapatkan environment dengan tipe benar
    const envString = process.env.VERCEL_ENV === "production" ? "production" : "test";
    const environment = envString as unknown as DeleGatorEnvironment;

    // Ambil function selector untuk fungsi saveScore(address,uint256)
    const saveScoreSelector = getFunctionSelector("saveScore(address,uint256)");

    // Definisikan scope dengan tipe literal 'functionCall' dan objek sesuai tipe ScopeConfig
    const scope = {
      type: "functionCall" as const,
      targets: [TETRA_SCORE_ADDRESS],
      selectors: [saveScoreSelector],
    };

    const delegation = await createDelegation({
      from: safeWallet,
      to: safeWallet,
      environment,
      scope,
      caveats: [],
    });

    console.log("🪶 Delegation created successfully:", delegation);
    return delegation;
  } catch (err) {
    console.error("❌ Failed to create delegation:", err);
    throw err;
  }
}
