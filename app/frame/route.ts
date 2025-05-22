export async function GET() {
  return new Response(
    JSON.stringify({
      "@context": "https://w3id.org/farcaster/frames/v1.0.0",
      "frame:image": "https://ttt-frame.vercel.app/api/og", 
      "frame:buttons": [
        { label: "Connect Wallet", action: "post" }
      ],
      "frame:post_url": "https://ttt-frame.vercel.app/api/frame",
      "frame:requires": "wallet"
    }),
    {
      headers: {
        "Content-Type": "application/ld+json"
      }
    }
  );
}
