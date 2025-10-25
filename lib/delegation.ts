import {
  createDelegation as rawCreateDelegation,
  type CreateDelegationOptions,
  type DeleGatorEnvironment,
} from "@metamask/delegation-toolkit";

type Environment = "production" | "test";

export async function createSafeDelegation(wallet: string) {
  if (!wallet.startsWith("0x")) throw new Error("❌ Invalid wallet address");
  const safeWallet = wallet as `0x${string}`;

  // Ambil environment dengan tipe jelas dulu
  const envString = (process.env.VERCEL_ENV === "production" ? "production" : "test") as Environment;
  // Cast ke tipe DeleGatorEnvironment
  const environment = envString as unknown as DeleGatorEnvironment;

  const opts: Partial<CreateDelegationOptions> = {
    from: safeWallet,
    to: safeWallet,
    environment,
    scope: "tetragon_score_bridge",
    caveats: [],
  };

  try {
    const result = await rawCreateDelegation(opts as CreateDelegationOptions);
    console.log("🪶 Delegation bridged successfully:", result);
    return result;
  } catch (err) {
    console.warn("⚠️ createSafeDelegation fallback to dummy:", err);
    return {
      from: safeWallet,
      to: safeWallet,
      signature: "0x" + "f".repeat(130),
      scope: "dummy_scope",
      timestamp: Date.now(),
    };
  }
}
