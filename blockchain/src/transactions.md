# EscrowAI — Transaction Flow Architecture

## Overview

All on-chain interactions go directly from the user's wallet to the EscrowAI contract.
There is no backend custodial wallet. The application never holds the user's private key.

- **Chain**: Arc Mainnet (chain ID 5042)
- **Gas token**: USDC (native currency on Arc)
- **Payment token**: USDC (`0x3600...0000`, 6 decimals)

## Prerequisites

1. User connects a wallet (e.g., MetaMask) configured for Arc Mainnet.
2. `ESCROW_CONTRACT_ADDRESS` is set in `.env` to the deployed EscrowAI address.
3. The connected chain ID is verified to equal `5042`.
4. The USDC token address is verified to equal `0x3600...0000`.

If any prerequisite is missing, the UI must block and clearly indicate the issue.

## Transaction 1 — Create Escrow

```
User wallet
  → EscrowAI.createEscrow(seller, amount, deadline)
      (no token transfer at creation)
  → transaction confirmation
  → emit EscrowCreated(escrowId, buyer, seller, amount, deadline)
  → return escrowId
```

- `createEscrow` does **not** transfer USDC.
- `deadline` is a Unix timestamp; it must be in the future.
- `amount` is in USDC base units (6 decimals): 50 USDC = `50_000_000`.

## Transaction 2 — Fund Escrow

```
User wallet
  → USDC.approve(EscrowAI, amount)
      (buyer authorizes the EscrowAI contract to pull funds)
  → EscrowAI.fundEscrow(escrowId)
      (safeTransferFrom: buyer → EscrowAI contract)
  → emit EscrowFunded(escrowId, buyer, amount)
```

Two separate transactions. The approve must succeed before fundEscrow is called.

## Transaction 3 — Release Escrow

```
Buyer wallet
  → EscrowAI.releaseEscrow(escrowId)
      (safeTransfer: EscrowAI contract → seller)
  → emit EscrowReleased(escrowId, buyer, seller, amount)
```

- Only callable by the buyer.
- Only valid when the escrow status is `FUNDED`.

## Transaction 4 — Refund Escrow

```
Buyer wallet
  → (after block.timestamp >= deadline)
  → EscrowAI.refundEscrow(escrowId)
      (safeTransfer: EscrowAI contract → buyer)
  → emit EscrowRefunded(escrowId, buyer, amount)
```

- Only callable by the buyer.
- Only valid when `block.timestamp >= deadline` and status is `FUNDED`.

## Safety checks (enforced in the integration layer)

| Condition | Action |
|---|---|
| Chain ID ≠ 5042 | Block transaction, show "Arc Mainnet required" |
| USDC address ≠ configured | Block transaction, show "USDC address mismatch" |
| ESCROW_CONTRACT_ADDRESS unset | Block transaction, show "EscrowAI contract not deployed" |
| Wallet not connected | Block transaction, prompt user to connect |
| Insufficient USDC allowance | Prompt user to approve first |

## Data flow

```
Config (config.ts)
  → Clients (clients.ts)
    → Network checks (network.ts)
      → USDC module (usdc.ts) / Escrow module (escrow.ts)
        → User wallet (viem wallet client)
        → EscrowAI contract → USDC contract
```

No API keys, private keys, or seed phrases are stored in source code.
All secrets come from environment variables read at runtime.
