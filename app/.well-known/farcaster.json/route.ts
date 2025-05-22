import { NextResponse } from "next/server";

export async function GET() {
  const farcasterConfig = {
    accountAssociation: {
      header: "eyJmaWQiOjMzMjgwOSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdhNTBCNGVjMjY0YTNjN2UzNGUxZWMyZUNjNTgyYWI0MjczZmNDZEEifQ",
      payload: "eyJkb21haW4iOiJ0dHQtZnJhbWUudmVyY2VsLmFwcCJ9",
      signature: "MHgxYjQzYzlhZTM5MzVmMDcwY2MzYWNjNGMxMWYyMDg5MjQ0MTI1MTFjNmNmMDM2NzNkZGM3N2FkZDI2ODI5ZDIyMWJmOGQ5MDlmN2UxNGU2MDNjNjE2MzMwMjI1ZDE5ODY4ODIxZGE3MjMzZDBlZjgwZjU1ZjZlNGNkZWM0NjA0YjFi"
    },
    frame: {
      version: "1",
      name: "TetraMON",
      iconUrl: "https://ttt-frame.vercel.app/icon.png",
      homeUrl: "https://ttt-frame.vercel.app",
      imageUrl: "https://ttt-frame.vercel.app/image.png",
      screenshotUrls: [],
      tags: ["monad", "farcaster", "miniapp", "game"],
      primaryCategory: "developer-tools",
      buttonTitle: "Check this out",
      splashImageUrl: "https://ttt-frame.vercel.app/splash.png",
      splashBackgroundColor: "#eeccff",
      webhookUrl: "https://ttt-frame.vercel.app/api/webhook"
    }
  };

  return NextResponse.json(farcasterConfig);
}
