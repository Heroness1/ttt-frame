import { Metadata } from "next";
import TetrisBoard from "../components/TetrisBoard";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "ttt-frame.vercel.app";

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/images/splash.png`, // ganti dengan image preview game kamu
  button: {
    title: "Play TetraMON",
    action: {
      type: "launch_frame",
      name: "TetraMON Game",
      url: `${APP_URL}/game`,
      splashImageUrl: `${APP_URL}/images/splash.png`, // splash image saat loading frame
      splashBackgroundColor: "#000000",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "TetraMON Game",
    openGraph: {
      title: "TetraMON Game",
      description: "Fast-paced Tetris with explosive combos!",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Page() {
  return <TetrisBoard />;
}
