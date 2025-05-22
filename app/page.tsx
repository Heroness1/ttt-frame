import Head from 'next/head'
import NadShoott from '../components/NadShoott'

export default function Home() {
  return (
    <>
      <Head>
        <meta
          name="fc:frame"
          content='{
            "version":"vNext",
            "imageUrl":"https://ttt-frame.vercel.app/images/splash.png",
            "button":{"title":"Play"},
            "postUrl":"https://ttt-frame.vercel.app/api/frame"
          }'
        />
        <title>TetraMON</title>
      </Head>
      <NadShoott />
    </>
  )
}
