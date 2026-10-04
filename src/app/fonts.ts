import localFont from "next/font/local";

// Self-hosted so builds never depend on Google Fonts being reachable.
export const display = localFont({
  variable: "--font-bsd",
  display: "swap",
  src: [
    { path: "../fonts/big-shoulders-display-latin-700-normal.woff2", weight: "700" },
    { path: "../fonts/big-shoulders-display-latin-800-normal.woff2", weight: "800" },
    { path: "../fonts/big-shoulders-display-latin-900-normal.woff2", weight: "900" },
  ],
});

export const sans = localFont({
  variable: "--font-fg",
  display: "swap",
  src: [
    { path: "../fonts/familjen-grotesk-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/familjen-grotesk-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/familjen-grotesk-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/familjen-grotesk-latin-700-normal.woff2", weight: "700" },
  ],
});
