import "./globals.css";

export const metadata = {
  title: "BetLens — Decision support for smarter bets",
  description: "Football betting decision tool with real-time insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
