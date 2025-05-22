import { setScore, getScore } from "@/lib/contract";

export async function POST(req: Request) {
  const body = await req.json();
  const wallet = body.untrustedData?.requester_wallet_address;

  // Simulasi set skor misalnya 100
  await setScore(wallet, 100); // Tambahin wallet param kalau perlu
  const score = await getScore(wallet);

  console.log("Wallet connected:", wallet, "Score:", score);

  return new Response(
    JSON.stringify({
      "@context": "https://w3id.org/farcaster/frames/v1.0.0",
      "frame:image": `https://ttt-frame.vercel.app/api/og?wallet=${wallet}&score=${score}`,
      "frame:buttons": [
        { label: "Play Again", action: "post" }
      ],
      "frame:post_url": "https://ttt-frame.vercel.app/frame"
    }),
    {
      headers: {
        "Content-Type": "application/ld+json"
      }
    }
  );
}