import { WalletConnect } from "@/components/wallet/WalletConnect";
import { NetworkStatus } from "@/components/wallet/NetworkStatus";
import { WalletStatus } from "@/components/wallet/WalletStatus";
import { USDCBalance } from "@/components/wallet/USDCBalance";
import { USDCAllowance } from "@/components/wallet/USDCAllowance";
import { CreateEscrowForm } from "@/components/escrow/CreateEscrowForm";
import { EscrowLookup } from "@/components/escrow/EscrowLookup";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">EscrowAI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Non-custodial USDC escrow on Arc Mainnet
          </p>
        </header>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <WalletConnect />
            <NetworkStatus />
          </div>

          <WalletStatus />

          <USDCBalance />

          <USDCAllowance />

          <div className="space-y-6">
            <EscrowLookup />
            <CreateEscrowForm />
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
          <p>
            EscrowAI is non-custodial. The AI never holds user funds or private keys.
            Transactions are signed directly in your connected wallet.
          </p>
        </footer>
      </div>
    </main>
  );
}
