import { expect } from "chai";
import { encodeEventTopics, encodeAbiParameters, getAddress } from "viem";
import { ESCROW_AI_ABI } from "../src/abis";
import { getEscrowIdFromReceipt } from "../src/escrow";

describe("getEscrowIdFromReceipt", function () {
  const ESCROW_ADDRESS = "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const ESCROW_ID = 42n;
  const BUYER = getAddress("0xf39fd6e51aad851bb313dd148bdb0c8ea218d2e7");
  const SELLER = getAddress("0x70997970c51812dc3a0104733d84c187b0c9b5a9");
  const AMOUNT = 50000000n;
  const DEADLINE = 1700000000n;

  function encodeEscrowCreatedLog() {
    const topics = encodeEventTopics({
      abi: ESCROW_AI_ABI,
      eventName: "EscrowCreated",
      args: [ESCROW_ID, BUYER, SELLER, AMOUNT, DEADLINE] as any,
    });

    const data = encodeAbiParameters(
      [
        { type: "uint256", name: "amount" },
        { type: "uint256", name: "deadline" },
      ],
      [AMOUNT, DEADLINE],
    );

    return { topics, data };
  }

  it("extracts the correct escrowId as a bigint from a valid receipt", function () {
    const log = encodeEscrowCreatedLog();
    const receipt = {
      logs: [
        {
          address: ESCROW_ADDRESS,
          topics: log.topics,
          data: log.data,
        },
      ],
    };

    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.equal(ESCROW_ID);
    expect(typeof result).to.equal("bigint");
  });

  it("extracts escrowId even when other logs are present", function () {
    const log = encodeEscrowCreatedLog();
    const receipt = {
      logs: [
        {
          address: "0x0000000000000000000000000000000000001234",
          topics: ["0x1234"],
          data: "0x0000",
        },
        {
          address: ESCROW_ADDRESS,
          topics: log.topics,
          data: log.data,
        },
        {
          address: "0x0000000000000000000000000000000000005678",
          topics: ["0x5678"],
          data: "0x0000",
        },
      ],
    };

    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.equal(ESCROW_ID);
  });

  it("respects contract address filter", function () {
    const log = encodeEscrowCreatedLog();
    const receipt = {
      logs: [
        {
          address: ESCROW_ADDRESS,
          topics: log.topics,
          data: log.data,
        },
        {
          address: "0x0000000000000000000000000000000000000001",
          topics: log.topics,
          data: log.data,
        },
      ],
    };

    const result = getEscrowIdFromReceipt(receipt as any, ESCROW_ADDRESS);
    expect(result).to.equal(ESCROW_ID);
  });

  it("returns null when EscrowCreated event is not present", function () {
    const receipt = {
      logs: [
        {
          address: ESCROW_ADDRESS,
          topics: encodeEventTopics({
            abi: ESCROW_AI_ABI,
            eventName: "EscrowFunded",
            args: [ESCROW_ID] as any,
          }),
          data: "0x",
        },
      ],
    };

    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.be.null;
  });

  it("returns null when receipt has no logs", function () {
    const receipt = { logs: [] };
    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.be.null;
  });

  it("returns null when log cannot be decoded", function () {
    const receipt = {
      logs: [
        {
          address: ESCROW_ADDRESS,
          topics: ["0xinvalid"],
          data: "0xinvalid",
        },
      ],
    };
    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.be.null;
  });

  it("does not use a fallback escrow ID", function () {
    const log = encodeEscrowCreatedLog();
    const receipt = {
      logs: [
        {
          address: ESCROW_ADDRESS,
          topics: log.topics,
          data: log.data,
        },
      ],
    };

    const result = getEscrowIdFromReceipt(receipt as any);
    expect(result).to.not.equal(1n);
    expect(result).to.equal(ESCROW_ID);
  });
});
