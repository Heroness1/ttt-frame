/**
 * 🧩 sendScore.ts
 * Kirim skor pemain ke smart contract di Monad Testnet lewat Pimlico + Delegation Toolkit.
 * Aman buat build & cocok buat Hackathon deployment.
 */

import { sendScoreBridge } from "./metaBridge";
import { TETRA_SCORE_ABI, TETRA_SCORE_ADDRESS } from "./tetrascore";

/**
 * Save player score ke chain
 * @param wallet - Alamat wallet pemain (EOA)
 * @param scoreValue - Skor numerik (angka)
 */
export async function sendScoreToChain(wallet: string, scoreValue: number) {
  try {
    if (!wallet || !wallet.startsWith("0x")) {
      throw new Error("⚠️ Wallet address invalid or not connected");
    }

    console.log("🎮 Sending score via metaBridge...");
    console.log("Wallet:", wallet);
    console.log("Score:", scoreValue);

    const txHash = await sendScoreBridge(
      wallet,
      scoreValue,
      TETRA_SCORE_ABI,
      TETRA_SCORE_ADDRESS
    );

    console.log("✅ Score successfully saved to Monad testnet!");
    console.log("🔗 Tx hash / UserOp:", txHash);

    return txHash;
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    throw new Error("Gagal menyimpan skor ke chain. Lihat console log untuk detail.");
  }
}