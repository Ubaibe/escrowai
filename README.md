# EscrowAI — Milestone 1

EscrowAI is a non-custodial, AI-assisted USDC escrow application for Arc Mainnet. This milestone contains only the smart-contract foundation; there is no frontend, AI integration, database, API, wallet UI, or mainnet deployment yet.

## Architecture

The AI proposes and explains escrow terms. The user reviews and authorizes each transaction. `EscrowAI.sol` holds and settles the configured ERC-20 token, while Arc Mainnet is the intended settlement layer.

The contract has no owner, admin withdrawal function, AI key, backend key, oracle, dispute flow, proxy, or centralized custody mechanism. Each escrow is controlled by the buyer and seller recorded in its own state.

## Escrow lifecycle

```text
CREATED -- buyer funds exact amount --> FUNDED
FUNDED -- buyer releases -----------> RELEASED
FUNDED -- buyer refunds after deadline --> REFUNDED
```

Creation does not transfer tokens. Funding uses `SafeERC20.safeTransferFrom`, so the buyer must approve the escrow contract first. Release sends the exact amount to the seller. A buyer may refund only after `block.timestamp >= deadline`. Reentrancy protection and checks-effects-interactions protect the state transitions. Unfunded `CREATED` escrows intentionally have no cancellation function and hold no funds.

## USDC handling

The production Arc Mainnet USDC address is:

`0x3600000000000000000000000000000000000000`

Arc Mainnet uses chain ID `5042`, RPC `https://rpc.mainnet.arc.io`, and Explorer `https://explorer.arc.io`.

The token address is supplied to the constructor and can be overridden with `USDC_TOKEN_ADDRESS` when running the deployment script. USDC has six decimals; tests use a six-decimal `MockUSDC` and base-unit amounts such as `100_000_000` for 100 USDC.

## Local testing

```bash
npm install
npm run compile
npm test
npm run typecheck
```

Hardhat's in-memory local network is used by the tests. No external RPC or private key is required.

## Deployment status

The deployment script prints network and contract addresses. It refuses Arc Mainnet unless `ALLOW_ARC_MAINNET_DEPLOY=true` is explicitly set after review. `DEPLOY_MOCK_USDC=true` can deploy the local mock token for local development.

**Arc Mainnet deployment is intentionally deferred until the contract and integration tests are complete.**

## Configuration

Create `blockchain/../.env` locally for later network use; it is ignored by Git:

```env
ARC_MAINNET_RPC_URL=https://rpc.mainnet.arc.io
ARC_MAINNET_CHAIN_ID=5042
PRIVATE_KEY=0x...
USDC_TOKEN_ADDRESS=0x3600000000000000000000000000000000000000
```

Never commit private keys, seed phrases, API keys, or `.env` files.
