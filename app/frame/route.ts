import { saveScoreSmart, getScore } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wallet = body.untrustedData?.requester_wallet_address;
    const privateKey = process.env.OWNER_PRIVATE_KEY;

    if (!privateKey) {
      return new Response(JSON.stringify({ error: "Missing OWNER_PRIVATE_KEY" }), {
        status: 500,
      });
    }

    await saveScoreSmart(privateKey, 100);
    const score = await getScore(wallet);

    console.log("✅ Wallet connected:", wallet, "Score:", score);

    return new Response(
      JSON.stringify({
        "@context": "https://w3id.org/farcaster/frames/v1.0.0",
        "frame:image": `https://ttt-frame.vercel.app/api/og?wallet=${wallet}&score=${score}`,
        "frame:buttons": [{ label: "Play Again", action: "post" }],
        "frame:post_url": "https://ttt-frame.vercel.app/frame",
      }),
      { headers: { "Content-Type": "application/ld+json" } }
    );
  } catch (err) {
    console.error("❌ Frame route error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
