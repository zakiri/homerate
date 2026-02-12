// Document configuration for Next.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="HomeRate - Sentetik Emtia Borsası" />
        <meta name="keywords" content="trading, cryptocurrency, commodities, OSMO, Osmosis" />
        <meta name="author" content="HomeRate Team" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
