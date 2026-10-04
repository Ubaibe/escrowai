export { arcMainnet, getArcConfig, ARC_CHAIN_ID, ARC_RPC_URL, ARC_EXPLORER, DEFAULT_USDC_ADDRESS, ARC_NATIVE_CURRENCY } from "./config";
export type { ArcConfig } from "./config";

export { ESCROW_AI_ABI, USDC_ABI } from "./abis";

export { createArcPublicClient, createArcWalletClient, createBrowserWalletClient } from "./clients";export {
  isArcMainnet,
  isUSDCAddress,
  isDefaultUSDCAddress,
  hasEscrowContract,
  getConnectedChain,
  isOnArcMainnet,
} from "./network";

export {
  USDC_DECIMALS,
  toUSDCBaseUnits,
  fromUSDCBaseUnits,
  usdcToString,
  createUSDCClient,
  getUSDCBalance,
  getUSDCAllowance,
  approveUSDC,
} from "./usdc";

export {
  validateAddress,
  validateSellerAddress,
  validateAmount,
  validateDeadline,
  validateCreateEscrowForm,
  getConfiguredEscrowAddress,
  getConfiguredUsdcAddress,
} from "./validation";
export type { EscrowFormErrors, EscrowFormData } from "./validation";

export {
  createEscrowContract,
  statusToString,
  createEscrow,
  getEscrowIdFromReceipt,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrow,
  isRefundable,
} from "./escrow";
export type { EscrowData, EscrowStatus } from "./escrow";

export {
  validateDeploymentEnvironment,
  readDeploymentEnv,
  deriveDeployerAddress,
  resolveUsdcAddress,
} from "./deploy";
export type { DeploymentEnv, DeploymentValidationResult } from "./deploy";
