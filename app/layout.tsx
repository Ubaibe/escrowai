import "./globals.css";
import type { ReactNode } from "react";
import { WalletProvider } from "@/contexts/WalletContext";

export const metadata = {
  title: "EscrowAI",
  description: "Non-custodial AI-assisted USDC escrow on Arc Mainnet",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
