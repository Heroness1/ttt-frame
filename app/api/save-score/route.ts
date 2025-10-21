import { saveScoreSmart } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const { wallet, score } = await req.json();

    if (!wallet || typeof score !== "number") {
      return new Response(
        JSON.stringify({ error: "Missing wallet or invalid score" }),
        { status: 400 }
      );
    }

    console.log(`🎮 Saving score for ${wallet}: ${score}`);

    const privateKey = process.env.OWNER_PRIVATE_KEY!;
    if (!privateKey) {
      throw new Error("Missing OWNER_PRIVATE_KEY in environment variables");
    }

    // ✅ Simpan skor ke smart contract
    const tx = await saveScoreSmart(privateKey, score);

    return new Response(
      JSON.stringify({
        success: true,
        tx,
        message: `Score ${score} saved successfully.`,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Failed to save score:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
