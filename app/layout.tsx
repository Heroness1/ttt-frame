// app/layout.tsx
export const metadata = {
  title: "TetraMON",
  description: "Score with some explode!.",
  openGraph: {
    title: "TetraMON",
    description: "Break Monad v2",
    images: [
      {
        url: "https://ttt-frame.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://yourdomain.vercel.app/og-image.png",
    "fc:frame:button:1": "Play Now",
    "fc:frame:button:1:action": "post_redirect",
    "fc:frame:post_url": "https://ttt-frame.vercel.app/game",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
      </head>
      <body style={{ fontFamily: '"Press Start 2P", monospace' }}>
        {children}
      </body>
    </html>
  );
}
