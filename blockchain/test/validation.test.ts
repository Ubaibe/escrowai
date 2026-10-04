import { expect } from "chai";
import {
  validateAddress,
  validateSellerAddress,
  validateAmount,
  validateDeadline,
  validateCreateEscrowForm,
  getConfiguredEscrowAddress,
  getConfiguredUsdcAddress,
  type EscrowFormData,
} from "../src/validation";
import { DEFAULT_USDC_ADDRESS } from "../src/config";
import { toUSDCBaseUnits } from "../src/usdc";

describe("Validation utilities", function () {
  const buyerAddress = "0x1234567890123456789012345678901234567890";
  const sellerAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

  describe("validateAddress", function () {
    it("returns true for a valid Ethereum address", function () {
      expect(validateAddress("0x1234567890123456789012345678901234567890")).to.be.true;
    });

    it("returns false for the zero address", function () {
      expect(validateAddress("0x0000000000000000000000000000000000000000")).to.be.true;
    });

    it("returns false for a clearly invalid string", function () {
      expect(validateAddress("not-an-address")).to.be.false;
    });

    it("returns false for an empty string", function () {
      expect(validateAddress("")).to.be.false;
    });

    it("returns false for undefined", function () {
      expect(validateAddress(undefined as any)).to.be.false;
    });

    it("handles addresses with mixed case", function () {
      expect(validateAddress("0x1234567890123456789012345678901234567890")).to.be.true;
    });
  });

  describe("validateSellerAddress", function () {
    it("accepts a valid seller that differs from buyer", function () {
      const result = validateSellerAddress(buyerAddress, sellerAddress);
      expect(result.valid).to.be.true;
      expect(result.error).to.be.undefined;
    });

    it("rejects an empty seller", function () {
      const result = validateSellerAddress(buyerAddress, "");
      expect(result.valid).to.be.false;
      expect(result.error).to.include("required");
    });

    it("rejects an invalid address", function () {
      const result = validateSellerAddress(buyerAddress, "not-an-address");
      expect(result.valid).to.be.false;
      expect(result.error).to.include("Invalid");
    });

    it("rejects seller equal to buyer", function () {
      const result = validateSellerAddress(buyerAddress, buyerAddress);
      expect(result.valid).to.be.false;
      expect(result.error).to.include("same as the buyer");
    });

    it("accepts when buyerAddress is undefined (no buyer set yet)", function () {
      const result = validateSellerAddress(undefined, sellerAddress);
      expect(result.valid).to.be.true;
    });
  });

  describe("validateAmount", function () {
    it("accepts a whole-number amount", function () {
      const result = validateAmount("25");
      expect(result.valid).to.be.true;
      expect(result.baseUnits).to.equal(toUSDCBaseUnits(25n));
    });

    it("accepts a decimal amount", function () {
      const result = validateAmount("25.50");
      expect(result.valid).to.be.true;
      expect(result.baseUnits).to.equal(25500000n);
    });

    it("accepts an amount with 6 decimal places", function () {
      const result = validateAmount("0.000001");
      expect(result.valid).to.be.true;
      expect(result.baseUnits).to.equal(1n);
    });

    it("accepts an amount with fewer decimal places", function () {
      const result = validateAmount("25.5");
      expect(result.valid).to.be.true;
      expect(result.baseUnits).to.equal(25500000n);
    });

    it("accepts a large amount", function () {
      const result = validateAmount("1000000");
      expect(result.valid).to.be.true;
      expect(result.baseUnits).to.equal(1000000000000n);
    });

    it("rejects zero", function () {
      const result = validateAmount("0");
      expect(result.valid).to.be.false;
      expect(result.error).to.include("greater than zero");
    });

    it("rejects zero with decimals", function () {
      const result = validateAmount("0.00");
      expect(result.valid).to.be.false;
    });

    it("rejects an empty string", function () {
      const result = validateAmount("");
      expect(result.valid).to.be.false;
      expect(result.error).to.include("required");
    });

    it("rejects a non-numeric string", function () {
      const result = validateAmount("abc");
      expect(result.valid).to.be.false;
      expect(result.error).to.include("valid USDC amount");
    });

    it("rejects more than 6 decimal places", function () {
      const result = validateAmount("25.1234567");
      expect(result.valid).to.be.false;
    });

    it("rejects a negative amount", function () {
      const result = validateAmount("-25");
      expect(result.valid).to.be.false;
    });

    it("rejects when balance is insufficient", function () {
      const result = validateAmount("100", 50000000n);
      expect(result.valid).to.be.false;
      expect(result.error).to.include("Insufficient");
    });

    it("accepts when balance is sufficient", function () {
      const result = validateAmount("25", 25000000n);
      expect(result.valid).to.be.true;
    });
  });

  describe("validateDeadline", function () {
    const now = Math.floor(Date.now() / 1000);
    const futureDate = new Date((now + 86400) * 1000).toISOString().slice(0, 16);
    const pastDate = new Date((now - 86400) * 1000).toISOString().slice(0, 16);

    it("accepts a future deadline", function () {
      const result = validateDeadline(futureDate, now);
      expect(result.valid).to.be.true;
      expect(result.unixTimestamp).to.be.a("number");
    });

    it("rejects a past deadline", function () {
      const result = validateDeadline(pastDate, now);
      expect(result.valid).to.be.false;
      expect(result.error).to.include("future");
    });

    it("rejects an empty deadline", function () {
      const result = validateDeadline("", now);
      expect(result.valid).to.be.false;
      expect(result.error).to.include("required");
    });

    it("rejects an invalid date string", function () {
      const result = validateDeadline("not-a-date", now);
      expect(result.valid).to.be.false;
      expect(result.error).to.include("Invalid");
    });
  });

  describe("validateCreateEscrowForm", function () {
    const validData: EscrowFormData = {
      seller: sellerAddress,
      amount: "25.50",
      deadline: new Date((Math.floor(Date.now() / 1000) + 86400) * 1000)
        .toISOString()
        .slice(0, 16),
    };

    it("returns no errors for a valid form with buyer", function () {
      const errors = validateCreateEscrowForm(validData, {
        buyerAddress: buyerAddress,
      });
      expect(Object.keys(errors)).to.have.length(0);
    });

    it("returns seller error for an invalid seller address", function () {
      const errors = validateCreateEscrowForm(
        { ...validData, seller: "not-an-address" },
        { buyerAddress: buyerAddress },
      );
      expect(errors.seller).to.exist;
    });

    it("returns seller error when seller equals buyer", function () {
      const errors = validateCreateEscrowForm(
        { ...validData, seller: buyerAddress },
        { buyerAddress: buyerAddress },
      );
      expect(errors.seller).to.include("same");
    });

    it("returns amount error for a zero amount", function () {
      const errors = validateCreateEscrowForm(
        { ...validData, amount: "0" },
        { buyerAddress: buyerAddress },
      );
      expect(errors.amount).to.exist;
    });

    it("returns deadline error for a past deadline", function () {
      const errors = validateCreateEscrowForm(
        { ...validData, deadline: pastDateStr() },
        { buyerAddress: buyerAddress, currentTime: now() },
      );
      expect(errors.deadline).to.exist;
    });

    function now(): number {
      return Math.floor(Date.now() / 1000);
    }
    function pastDateStr(): string {
      return new Date((now() - 86400) * 1000).toISOString().slice(0, 16);
    }
  });

  describe("getConfiguredEscrowAddress", function () {
    const originalEscrow = process.env.ESCROW_CONTRACT_ADDRESS;
    const originalPublicEscrow = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

    beforeEach(function () {
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    });

    afterEach(function () {
      if (originalEscrow !== undefined) process.env.ESCROW_CONTRACT_ADDRESS = originalEscrow;
      else delete process.env.ESCROW_CONTRACT_ADDRESS;
      if (originalPublicEscrow !== undefined) process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS = originalPublicEscrow;
      else delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
    });

    it("returns undefined when no env var is set", function () {
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      delete process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;
      expect(getConfiguredEscrowAddress()).to.be.undefined;
    });

    it("returns the address when ESCROW_CONTRACT_ADDRESS is set", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
      expect(getConfiguredEscrowAddress()).to.equal(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      );
    });

    it("returns the address when NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS is set", function () {
      process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
      expect(getConfiguredEscrowAddress()).to.equal(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      );
    });

    it("returns undefined for an invalid address format", function () {
      process.env.ESCROW_CONTRACT_ADDRESS = "not-an-address";
      expect(getConfiguredEscrowAddress()).to.be.undefined;
    });
  });

  describe("getConfiguredUsdcAddress", function () {
    const originalUsdc = process.env.ARC_USDC_ADDRESS;
    const originalPublicUsdc = process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS;

    afterEach(function () {
      if (originalUsdc !== undefined) process.env.ARC_USDC_ADDRESS = originalUsdc;
      else delete process.env.ARC_USDC_ADDRESS;
      if (originalPublicUsdc !== undefined) process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS = originalPublicUsdc;
      else delete process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS;
    });

    it("returns the default Arc USDC address when no env var is set", function () {
      delete process.env.ARC_USDC_ADDRESS;
      delete process.env.NEXT_PUBLIC_ARC_USDC_ADDRESS;
      expect(getConfiguredUsdcAddress()).to.equal(DEFAULT_USDC_ADDRESS);
    });

    it("returns a custom address when set", function () {
      process.env.ARC_USDC_ADDRESS = "0x1234567890123456789012345678901234567890";
      expect(getConfiguredUsdcAddress()).to.equal(
        "0x1234567890123456789012345678901234567890",
      );
    });
  });
});
