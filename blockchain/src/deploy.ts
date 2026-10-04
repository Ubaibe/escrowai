import { getAddress } from "viem";
import { ARC_CHAIN_ID, DEFAULT_USDC_ADDRESS } from "./config";

export interface DeploymentValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DeploymentEnv {
  allowArcMainnetDeploy: boolean;
  privateKey: string | undefined;
  arcRpcUrl: string | undefined;
  arcChainId: string | undefined;
  arcUsdcAddress: string | undefined;
  connectedChainId: bigint | null;
  deployerAddress: string | undefined;
}

export function validateDeploymentEnvironment(
  env: DeploymentEnv,
): DeploymentValidationResult {
  const errors: string[] = [];

  if (!env.allowArcMainnetDeploy) {
    errors.push(
      "ALLOW_ARC_MAINNET_DEPLOY=true is required for Arc Mainnet deployment",
    );
  }

  if (!env.privateKey) {
    errors.push("PRIVATE_KEY is required for Arc Mainnet deployment");
  }

  if (!env.arcRpcUrl) {
    errors.push("ARC_RPC_URL is required for Arc Mainnet deployment");
  }

  const expectedChainId = String(ARC_CHAIN_ID);
  const providedChainId = env.arcChainId ?? "";
  if (providedChainId !== expectedChainId) {
    errors.push(
      `ARC_CHAIN_ID must be ${expectedChainId}, got ${env.arcChainId ?? "undefined"}`,
    );
  }

  const expectedUsdc = DEFAULT_USDC_ADDRESS.toLowerCase();
  const providedUsdc = env.arcUsdcAddress?.toLowerCase();
  if (providedUsdc !== expectedUsdc) {
    errors.push(
      `ARC_USDC_ADDRESS must be ${DEFAULT_USDC_ADDRESS}, got ${env.arcUsdcAddress ?? "undefined"}`,
    );
  }

  if (env.connectedChainId === null) {
    errors.push("Could not verify connected chain ID — check ARC_RPC_URL connectivity");
  } else if (env.connectedChainId !== BigInt(ARC_CHAIN_ID)) {
    errors.push(
      `Connected network chain ID must be ${ARC_CHAIN_ID} (Arc Mainnet), got ${env.connectedChainId.toString()}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function readDeploymentEnv(overrides?: {
  connectedChainId?: bigint | null;
  deployerAddress?: string | undefined;
}): DeploymentEnv {
  return {
    allowArcMainnetDeploy: process.env.ALLOW_ARC_MAINNET_DEPLOY === "true",
    privateKey: process.env.PRIVATE_KEY,
    arcRpcUrl: process.env.ARC_RPC_URL,
    arcChainId: process.env.ARC_CHAIN_ID,
    arcUsdcAddress: process.env.ARC_USDC_ADDRESS,
    connectedChainId: overrides?.connectedChainId ?? null,
    deployerAddress: overrides?.deployerAddress,
  };
}

export function deriveDeployerAddress(privateKey: string): string {
  try {
    return getAddress(
      "0x" +
        privateKey
          .replace(/^0x/, "")
          .slice(0, 40)
          .toLowerCase(),
    );
  } catch {
    return "0x0000000000000000000000000000000000000000";
  }
}

export function resolveUsdcAddress(): string {
  return process.env.ARC_USDC_ADDRESS || DEFAULT_USDC_ADDRESS;
}
