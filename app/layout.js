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

const RECOVERY_HANDOFF = `(function(){var p=location.pathname,s=location.search,h=location.hash;
if(/\\/reset\\/?$/.test(p))return;
if((/[?&]token_hash=/.test(s)&&/[?&]type=recovery/.test(s))||/(^#|&)type=recovery/.test(h))
location.replace("${BASE}/reset/"+s+h);})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* A password-reset link that lands on the app rather than /reset/ — sent
            before that page existed, or one whose redirect Supabase fell back on
            — is handed over untouched. Inline and first, because the Supabase
            client consumes the token the moment it starts. */}
        <script dangerouslySetInnerHTML={{ __html: RECOVERY_HANDOFF }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
