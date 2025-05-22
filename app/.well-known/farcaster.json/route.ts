// app/.well-known/farcaster/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjMzMjgwOSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdhNTBCNGVjMjY0YTNjN2UzNGUxZWMyZUNjNTgyYWI0MjczZmNDZEEifQ",
      payload: "eyJkb21haW4iOiJ0dHQtZnJhbWUudmVyY2VsLmFwcCJ9",
      signature: "xv9tjru7exwPL3NGsmC0FsWNkuufmv5-kcGxyvtRqlADr0DH1alJDYVQjfFCyXn_yPqwlu4UpBHqh_1mCu2d04E"
    },
    frame: {
      version: "vNext",
      imageUrl: "https://ttt-frame.vercel.app/start-screen.png",
      imageAspectRatio: "1:1",
      buttons: [{ label: "Start Game", action: "post" }],
      postUrl: "https://ttt-frame.vercel.app/api/game"
    }
  });
}
