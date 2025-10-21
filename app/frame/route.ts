import { getScore } from "@/lib/contract";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wallet = body.untrustedData?.requester_wallet_address;

    if (!wallet) {
      return new Response(
        JSON.stringify({ error: "Missing wallet address" }),
        { status: 400 }
      );
    }

    // Ambil skor dari blockchain (READ only)
    const score = await getScore(wallet);
    console.log("✅ Wallet connected:", wallet, "Score:", score);

    // Balikkan frame response
    return new Response(
      JSON.stringify({
        "@context": "https://w3id.org/farcaster/frames/v1.0.0",
        "frame:image": `https://ttt-frame.vercel.app/api/og?wallet=${wallet}&score=${score}`,
        "frame:buttons": [{ label: "Play Now", action: "post_redirect" }],
        "frame:post_url": "https://ttt-frame.vercel.app/game",
      }),
      { headers: { "Content-Type": "application/ld+json" } }
    );
  } catch (err) {
    console.error("❌ Frame route error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
}
