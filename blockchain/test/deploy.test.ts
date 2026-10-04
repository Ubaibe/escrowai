import { expect } from "chai";
import {
  validateDeploymentEnvironment,
  readDeploymentEnv,
  deriveDeployerAddress,
  resolveUsdcAddress,
} from "../src/deploy";
import { ARC_CHAIN_ID, DEFAULT_USDC_ADDRESS } from "../src/config";
import type { DeploymentEnv } from "../src/deploy";

describe("Deployment configuration validation", function () {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(function () {
    process.env = { ...ORIGINAL_ENV };
  });

  function validEnv(overrides: Partial<DeploymentEnv> = {}): DeploymentEnv {
    return {
      allowArcMainnetDeploy: true,
      privateKey: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      arcRpcUrl: "https://rpc.mainnet.arc.io",
      arcChainId: "5042",
      arcUsdcAddress: "0x3600000000000000000000000000000000000000",
      connectedChainId: BigInt(5042),
      deployerAddress: "0xF39Fd6e51AAD851bB313Dd148BdB0c8ea218D2E7",
      ...overrides,
    };
  }

  describe("validateDeploymentEnvironment", function () {
    it("accepts a correctly configured Arc Mainnet deployment environment", function () {
      const result = validateDeploymentEnvironment(validEnv());
      expect(result.valid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it("rejects when ALLOW_ARC_MAINNET_DEPLOY is not true", function () {
      const result = validateDeploymentEnvironment(validEnv({ allowArcMainnetDeploy: false }));
      expect(result.valid).to.be.false;
      expect(result.errors).to.include(
        "ALLOW_ARC_MAINNET_DEPLOY=true is required for Arc Mainnet deployment",
      );
    });

    it("rejects when PRIVATE_KEY is missing", function () {
      const result = validateDeploymentEnvironment(validEnv({ privateKey: undefined }));
      expect(result.valid).to.be.false;
      expect(result.errors).to.include(
        "PRIVATE_KEY is required for Arc Mainnet deployment",
      );
    });

    it("rejects when ARC_RPC_URL is missing", function () {
      const result = validateDeploymentEnvironment(validEnv({ arcRpcUrl: undefined }));
      expect(result.valid).to.be.false;
      expect(result.errors).to.include(
        "ARC_RPC_URL is required for Arc Mainnet deployment",
      );
    });

    it("rejects wrong ARC_CHAIN_ID", function () {
      const result = validateDeploymentEnvironment(validEnv({ arcChainId: "1" }));
      expect(result.valid).to.be.false;
      expect(result.errors.some((e) => e.includes("ARC_CHAIN_ID must be 5042"))).to.be.true;
    });

    it("rejects undefined ARC_CHAIN_ID", function () {
      const result = validateDeploymentEnvironment(validEnv({ arcChainId: undefined }));
      expect(result.valid).to.be.false;
      expect(result.errors.some((e) => e.includes("ARC_CHAIN_ID must be 5042"))).to.be.true;
    });

    it("rejects wrong ARC_USDC_ADDRESS", function () {
      const result = validateDeploymentEnvironment(
        validEnv({ arcUsdcAddress: "0x0000000000000000000000000000000000000001" }),
      );
      expect(result.valid).to.be.false;
      expect(result.errors.some((e) => e.includes("ARC_USDC_ADDRESS must be"))).to.be.true;
    });

    it("rejects undefined ARC_USDC_ADDRESS", function () {
      const result = validateDeploymentEnvironment(validEnv({ arcUsdcAddress: undefined }));
      expect(result.valid).to.be.false;
      expect(result.errors.some((e) => e.includes("ARC_USDC_ADDRESS must be"))).to.be.true;
    });

    it("rejects when connected chain ID does not match Arc Mainnet (5042)", function () {
      const result = validateDeploymentEnvironment(validEnv({ connectedChainId: BigInt(1) }));
      expect(result.valid).to.be.false;
      expect(result.errors.some((e) => e.includes("Connected network chain ID must be 5042"))).to.be.true;
    });

    it("rejects when connected chain ID cannot be verified (null)", function () {
      const result = validateDeploymentEnvironment(validEnv({ connectedChainId: null }));
      expect(result.valid).to.be.false;
      expect(
        result.errors.some((e) => e.includes("Could not verify connected chain ID")),
      ).to.be.true;
    });

    it("accepts correctly checksummed USDC address", function () {
      const result = validateDeploymentEnvironment(
        validEnv({ arcUsdcAddress: "0x3600000000000000000000000000000000000000" }),
      );
      expect(result.valid).to.be.true;
    });

    it("rejects multiple missing fields simultaneously", function () {
      const result = validateDeploymentEnvironment(validEnv({ allowArcMainnetDeploy: false, privateKey: undefined, arcRpcUrl: undefined }));
      expect(result.valid).to.be.false;
      expect(result.errors.length).to.be.gte(3);
    });
  });

  describe("readDeploymentEnv", function () {
    it("reads correct values from environment variables", function () {
      process.env.ALLOW_ARC_MAINNET_DEPLOY = "true";
      process.env.PRIVATE_KEY = "0xabc123";
      process.env.ARC_RPC_URL = "https://rpc.test.net";
      process.env.ARC_CHAIN_ID = "5042";
      process.env.ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

      const env = readDeploymentEnv({ connectedChainId: BigInt(5042) });
      expect(env.allowArcMainnetDeploy).to.be.true;
      expect(env.privateKey).to.equal("0xabc123");
      expect(env.arcRpcUrl).to.equal("https://rpc.test.net");
      expect(env.arcChainId).to.equal("5042");
      expect(env.arcUsdcAddress).to.equal("0x3600000000000000000000000000000000000000");
      expect(env.connectedChainId).to.equal(BigInt(5042));
    });

    it("returns false for allowArcMainnetDeploy when not set", function () {
      delete process.env.ALLOW_ARC_MAINNET_DEPLOY;
      const env = readDeploymentEnv();
      expect(env.allowArcMainnetDeploy).to.be.false;
    });
  });

  describe("deriveDeployerAddress", function () {
    it("returns a valid address from a private key", function () {
      const pk = "0x" + "a".repeat(64);
      const addr = deriveDeployerAddress(pk);
      expect(addr).to.match(/^0x[0-9a-fA-F]{40}$/);
    });

    it("strips 0x prefix if present", function () {
      const pk = "0x" + "b".repeat(64);
      const addr = deriveDeployerAddress(pk);
      expect(addr).to.match(/^0x[0-9a-fA-F]{40}$/);
    });

    it("returns zero address for a malformed private key", function () {
      const addr = deriveDeployerAddress("invalid");
      expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("resolveUsdcAddress", function () {
    it("returns DEFAULT_USDC_ADDRESS when env var is not set", function () {
      delete process.env.ARC_USDC_ADDRESS;
      expect(resolveUsdcAddress()).to.equal(DEFAULT_USDC_ADDRESS);
    });

    it("returns env var value when set", function () {
      process.env.ARC_USDC_ADDRESS = "0x1234567890123456789012345678901234567890";
      expect(resolveUsdcAddress()).to.equal("0x1234567890123456789012345678901234567890");
    });
  });

  describe("ARC configuration constants", function () {
    it("ARC_CHAIN_ID is 5042", function () {
      expect(ARC_CHAIN_ID).to.equal(5042);
    });

    it("DEFAULT_USDC_ADDRESS is the Arc native USDC address", function () {
      expect(DEFAULT_USDC_ADDRESS).to.equal("0x3600000000000000000000000000000000000000");
    });
  });
});
