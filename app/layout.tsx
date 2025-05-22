// layout.tsx
export const metadata = {
  title: "TetraMON",
  description: "Break Monad v2 by Lure369.nad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FONT NEON */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        {/* ANIMASI */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
      </head>
      <body
        style={{
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {children}
      </body>
    </html>
  );
}
