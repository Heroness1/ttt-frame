import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Parse data dari Warpcast
  const body = await request.json();
  const { buttonIndex } = body.untrustedData;

  // Game State
  let imageUrl: string;
  let buttons: { label: string; action: string }[] = [];

  // Logika Game
  if (buttonIndex === 1) { // Tombol "Start Game" ditekan
    imageUrl = "https://ttt-frame.vercel.app/game-screen.png";
    buttons = [
      { label: "⬅️ Left", action: "post" },
      { label: "➡️ Right", action: "post" },
      { label: "🔄 Reset", action: "post" }
    ];
  } else if (buttonIndex === 3) { // Tombol "Reset"
    imageUrl = "https://ttt-frame.vercel.app/start-screen.png";
    buttons = [{ label: "Start Game", action: "post" }];
  } else { // Gerakan kiri/kanan
    imageUrl = "https://ttt-frame.vercel.app/action-screen.png";
    buttons = [
      { label: "⬆️ Up", action: "post" },
      { label: "⬇️ Down", action: "post" }
    ];
  }

  return NextResponse.json({
    frame: {
      version: "vNext",
      imageUrl,
      imageAspectRatio: "1:1",
      buttons,
      postUrl: "https://ttt-frame.vercel.app/api/game"
    }
  });
}
