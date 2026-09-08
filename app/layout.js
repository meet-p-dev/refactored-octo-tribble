import "./globals.css";

const BASE = "/refactored-octo-tribble";

export const metadata = {
  title: "MoneyTrack",
  // PWA manifest — gives Android a real standalone install ("Add to home screen"
  // becomes a full app, not a browser bookmark). Path must carry the GitHub Pages
  // basePath explicitly: Next's metadata fields are emitted verbatim.
  manifest: `${BASE}/manifest.json`,
  icons: {
    icon: `${BASE}/icon-192.png`,
    apple: `${BASE}/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoneyTrack",
  },
  // Next's appleWebApp.capable only emits the unprefixed "mobile-web-app-capable"
  // (recognized by iOS 17.4+). Older iOS needs the "apple-" prefixed tag for true
  // full-screen standalone mode when added to the home screen — add it explicitly
  // so both old and new iOS get the same behavior the buildless version had.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Colors the browser/OS chrome (Android status bar, iOS Safari tab bar) to match
  // the app canvas in each appearance.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
