import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest) {
  return Response.json({
    frame: {
      version: "1",
      name: "Tetra MON",
      iconUrl: "https://ttt-frame.vercel.app/images/icon.png",
      homeUrl: "https://ttt-frame.vercel.app",
      imageUrl: "https://ttt-frame.vercel.app/images/feed.png",
      screenshotUrls: [],
      tags: ["monad", "farcaster", "miniapp", "game"],
      primaryCategory: "developer-tools",
      buttonTitle: "Play",
      splashImageUrl: "https://ttt-frame.vercel.app/images/splash.png",
      splashBackgroundColor: "#ffffff",
      webhookUrl: "https://ttt-frame.vercel.app/api/webhook",
    },
  });
}
