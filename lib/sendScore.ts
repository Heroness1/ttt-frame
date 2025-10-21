import { ethers } from "ethers";
import { TETRA_SCORE_ADDRESS, TETRA_SCORE_ABI } from "./tetrascore";

export async function sendScoreToChain(score: number) {
  try {
    if (!window.ethereum) throw new Error("MetaMask not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(TETRA_SCORE_ADDRESS, TETRA_SCORE_ABI, signer);

    const tx = await contract.saveScore(score);
    console.log("⏳ Sending score:", score);
    await tx.wait();

    alert(`✅ Score ${score} saved!`);
  } catch (err) {
    console.error("❌ Failed to send score:", err);
    alert("Failed to send score, check console for details.");
  }
}
