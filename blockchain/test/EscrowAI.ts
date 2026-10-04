import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

const AMOUNT = 100_000_000n;
const INITIAL_BALANCE = 1_000_000_000n;
const DEADLINE_OFFSET = 60 * 60;

async function deployFixture() {
  const [buyer, seller, other, random] = await ethers.getSigners();
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc: any = await MockUSDC.deploy();
  await usdc.waitForDeployment();

  const EscrowAI = await ethers.getContractFactory("EscrowAI");
  const escrow: any = await EscrowAI.deploy(await usdc.getAddress());
  await escrow.waitForDeployment();

  await usdc.mint(buyer.address, INITIAL_BALANCE);
  await usdc.mint(seller.address, INITIAL_BALANCE);
  await usdc.mint(other.address, INITIAL_BALANCE);
  await usdc.mint(random.address, INITIAL_BALANCE);

  return { buyer, seller, other, random, usdc, escrow };
}

async function createEscrow(
  escrow: any,
  buyer: any,
  seller: any,
  amount = AMOUNT,
  deadlineOffset = DEADLINE_OFFSET,
) {
  const deadline = (await time.latest()) + deadlineOffset;
  const tx = await escrow.connect(buyer).createEscrow(seller.address, amount, deadline);
  const receipt = await tx.wait();
  let escrowId: bigint | undefined;

  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = escrow.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === "EscrowCreated") {
        escrowId = BigInt(parsed.args.escrowId);
        break;
      }
    } catch {
    }
  }

  if (escrowId === undefined) throw new Error("EscrowCreated event was not found");
  return { escrowId, deadline };
}

async function fundEscrow(
  escrow: any,
  usdc: any,
  buyer: any,
  escrowId: bigint,
  amount = AMOUNT,
) {
  await usdc.connect(buyer).approve(escrow.target, amount);
  return escrow.connect(buyer).fundEscrow(escrowId);
}

async function escrowData(escrow: any, escrowId: bigint) {
  return escrow.getEscrow(escrowId);
}

describe("EscrowAI", function () {
  describe("deployment", function () {
    it("deploys successfully and stores the configured USDC address", async function () {
      const { usdc, escrow } = await loadFixture(deployFixture);

      expect(await escrow.usdcToken()).to.equal(await usdc.getAddress());
      expect(await usdc.decimals()).to.equal(6);
    });

    it("rejects a zero token address", async function () {
      const { buyer } = await loadFixture(deployFixture);
      const EscrowAI = await ethers.getContractFactory("EscrowAI");

      await expect(
        EscrowAI.deploy(ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(EscrowAI, "InvalidTokenAddress");
      void buyer;
    });
  });

  describe("creation", function () {
    it("creates an escrow with the buyer, seller, amount, deadline, and CREATED status", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const buyerBalanceBefore = await usdc.balanceOf(buyer.address);

      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      const data = await escrowData(escrow, escrowId);

      expect(data.id).to.equal(escrowId);
      expect(data.buyer).to.equal(buyer.address);
      expect(data.seller).to.equal(seller.address);
      expect(data.amount).to.equal(AMOUNT);
      expect(data.createdAt).to.be.greaterThan(0);
      expect(data.deadline).to.equal(deadline);
      expect(data.status).to.equal(0);
      expect(await usdc.balanceOf(buyer.address)).to.equal(buyerBalanceBefore);
      expect(await usdc.balanceOf(escrow.target)).to.equal(0);
    });

    it("emits EscrowCreated with the expected arguments", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + DEADLINE_OFFSET;

      await expect(escrow.connect(buyer).createEscrow(seller.address, AMOUNT, deadline))
        .to.emit(escrow, "EscrowCreated")
        .withArgs(1n, buyer.address, seller.address, AMOUNT, deadline);
    });

    it("assigns a unique ID to each escrow", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);

      const first = await createEscrow(escrow, buyer, seller);
      const second = await createEscrow(escrow, buyer, seller);

      expect(first.escrowId).to.equal(1n);
      expect(second.escrowId).to.equal(2n);
      expect(first.escrowId).to.not.equal(second.escrowId);
    });

    it("rejects a zero seller", async function () {
      const { buyer, escrow } = await loadFixture(deployFixture);

      await expect(
        escrow.connect(buyer).createEscrow(ethers.ZeroAddress, AMOUNT, (await time.latest()) + DEADLINE_OFFSET),
      ).to.be.revertedWithCustomError(escrow, "InvalidSeller");
    });

    it("rejects an escrow where buyer and seller are the same", async function () {
      const { buyer, escrow } = await loadFixture(deployFixture);

      await expect(
        escrow.connect(buyer).createEscrow(buyer.address, AMOUNT, (await time.latest()) + DEADLINE_OFFSET),
      ).to.be.revertedWithCustomError(escrow, "BuyerEqualsSeller");
    });

    it("rejects a zero amount", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);

      await expect(
        escrow.connect(buyer).createEscrow(seller.address, 0, (await time.latest()) + DEADLINE_OFFSET),
      ).to.be.revertedWithCustomError(escrow, "InvalidAmount");
    });

    it("rejects a deadline in the past", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);

      await expect(
        escrow.connect(buyer).createEscrow(seller.address, AMOUNT, (await time.latest()) - 1),
      ).to.be.revertedWithCustomError(escrow, "InvalidDeadline");
    });

    it("rejects a deadline equal to the current timestamp", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);

      await expect(
        escrow.connect(buyer).createEscrow(seller.address, AMOUNT, await time.latest()),
      ).to.be.revertedWithCustomError(escrow, "InvalidDeadline");
    });
  });

  describe("funding", function () {
    it("funds an escrow with the exact six-decimal USDC amount", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      const buyerBefore = await usdc.balanceOf(buyer.address);
      const sellerBefore = await usdc.balanceOf(seller.address);
      const contractBefore = await usdc.balanceOf(escrow.target);

      const tx = await fundEscrow(escrow, usdc, buyer, escrowId);
      await expect(tx).to.emit(escrow, "EscrowFunded").withArgs(escrowId, buyer.address, AMOUNT);

      expect(await usdc.balanceOf(buyer.address)).to.equal(buyerBefore - AMOUNT);
      expect(await usdc.balanceOf(seller.address)).to.equal(sellerBefore);
      expect(await usdc.balanceOf(escrow.target)).to.equal(contractBefore + AMOUNT);
      expect((await escrowData(escrow, escrowId)).status).to.equal(1);
    });

    it("rejects funding by a non-buyer", async function () {
      const { buyer, seller, other, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await usdc.connect(other).approve(escrow.target, AMOUNT);

      await expect(escrow.connect(other).fundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
      expect((await escrowData(escrow, escrowId)).status).to.equal(0);
    });

    it("rejects funding a nonexistent escrow", async function () {
      const { buyer, usdc, escrow } = await loadFixture(deployFixture);
      await usdc.connect(buyer).approve(escrow.target, AMOUNT);

      await expect(escrow.connect(buyer).fundEscrow(999n))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
    });

    it("rejects funding an escrow twice", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);

      await expect(escrow.connect(buyer).fundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });

    it("rejects funding without an allowance", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);

      await expect(escrow.connect(buyer).fundEscrow(escrowId))
        .to.be.revertedWithCustomError(usdc, "ERC20InsufficientAllowance");
      expect(await usdc.balanceOf(escrow.target)).to.equal(0);
    });

    it("rejects funding without a sufficient balance", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await usdc.connect(buyer).approve(escrow.target, ethers.MaxUint256);
      await usdc.connect(buyer).transfer(seller.address, INITIAL_BALANCE);

      await expect(escrow.connect(buyer).fundEscrow(escrowId))
        .to.be.revertedWithCustomError(usdc, "ERC20InsufficientBalance");
      expect((await escrowData(escrow, escrowId)).status).to.equal(0);
    });
  });

  describe("release", function () {
    it("releases the exact amount to the seller", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      const sellerBefore = await usdc.balanceOf(seller.address);
      const contractBefore = await usdc.balanceOf(escrow.target);

      const tx = await escrow.connect(buyer).releaseEscrow(escrowId);
      await expect(tx)
        .to.emit(escrow, "EscrowReleased")
        .withArgs(escrowId, buyer.address, seller.address, AMOUNT);

      expect(await usdc.balanceOf(seller.address)).to.equal(sellerBefore + AMOUNT);
      expect(await usdc.balanceOf(escrow.target)).to.equal(contractBefore - AMOUNT);
      expect((await escrowData(escrow, escrowId)).status).to.equal(2);
    });

    it("rejects release by the seller", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);

      await expect(escrow.connect(seller).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("rejects release by a random account", async function () {
      const { buyer, seller, random, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);

      await expect(escrow.connect(random).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("rejects release of an unfunded escrow", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);

      await expect(escrow.connect(buyer).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });

    it("rejects release of an already released escrow", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await escrow.connect(buyer).releaseEscrow(escrowId);

      await expect(escrow.connect(buyer).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });

    it("rejects release after refund", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);
      await escrow.connect(buyer).refundEscrow(escrowId);

      await expect(escrow.connect(buyer).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });
  });

  describe("refund", function () {
    it("reports that a funded escrow is not refundable before its deadline", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);

      expect(await escrow.isRefundable(escrowId)).to.equal(false);
    });

    it("reports that a funded escrow is refundable at its deadline", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);

      expect(await escrow.isRefundable(escrowId)).to.equal(true);
    });

    it("rejects refund before the deadline", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);

      await expect(escrow.connect(buyer).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "DeadlineNotReached");
    });

    it("refunds the exact amount to the buyer after the deadline", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      const buyerBefore = await usdc.balanceOf(buyer.address);
      const contractBefore = await usdc.balanceOf(escrow.target);
      await time.increaseTo(deadline);

      const tx = await escrow.connect(buyer).refundEscrow(escrowId);
      await expect(tx).to.emit(escrow, "EscrowRefunded").withArgs(escrowId, buyer.address, AMOUNT);

      expect(await usdc.balanceOf(buyer.address)).to.equal(buyerBefore + AMOUNT);
      expect(await usdc.balanceOf(escrow.target)).to.equal(contractBefore - AMOUNT);
      expect((await escrowData(escrow, escrowId)).status).to.equal(3);
      expect(await escrow.isRefundable(escrowId)).to.equal(false);
    });

    it("allows refund exactly at the deadline", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);

      await expect(escrow.connect(buyer).refundEscrow(escrowId))
        .to.emit(escrow, "EscrowRefunded");
    });

    it("rejects refund by the seller", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);

      await expect(escrow.connect(seller).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("rejects refund by a random account", async function () {
      const { buyer, seller, random, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);

      await expect(escrow.connect(random).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
    });

    it("rejects refund of an unfunded escrow", async function () {
      const { buyer, seller, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await time.increaseTo(deadline);

      await expect(escrow.connect(buyer).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });

    it("rejects refunding an escrow twice", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId, deadline } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await time.increaseTo(deadline);
      await escrow.connect(buyer).refundEscrow(escrowId);

      await expect(escrow.connect(buyer).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });

    it("rejects refund of a released escrow", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      await escrow.connect(buyer).releaseEscrow(escrowId);

      await expect(escrow.connect(buyer).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "InvalidStatus");
    });
  });

  describe("security", function () {
    it("keeps funds in escrow when an unrelated account attempts settlement", async function () {
      const { buyer, seller, random, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      const contractBefore = await usdc.balanceOf(escrow.target);

      await expect(escrow.connect(random).releaseEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
      await expect(escrow.connect(random).refundEscrow(escrowId))
        .to.be.revertedWithCustomError(escrow, "Unauthorized");
      expect(await usdc.balanceOf(escrow.target)).to.equal(contractBefore);
    });

    it("rejects nonexistent escrows for views and settlement functions", async function () {
      const { buyer, seller, usdc, escrow } = await loadFixture(deployFixture);
      const missingId = 999n;

      await expect(escrow.getEscrow(missingId))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
      await expect(escrow.isRefundable(missingId))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
      await expect(escrow.connect(buyer).fundEscrow(missingId))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
      await expect(escrow.connect(buyer).releaseEscrow(missingId))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
      await expect(escrow.connect(buyer).refundEscrow(missingId))
        .to.be.revertedWithCustomError(escrow, "EscrowNotFound");
      void seller;
      void usdc;
    });

    it("prevents an unrelated account from withdrawing escrow tokens", async function () {
      const { buyer, seller, random, usdc, escrow } = await loadFixture(deployFixture);
      const { escrowId } = await createEscrow(escrow, buyer, seller);
      await fundEscrow(escrow, usdc, buyer, escrowId);
      const contractBefore = await usdc.balanceOf(escrow.target);
      const randomBefore = await usdc.balanceOf(random.address);

      await expect(
        usdc.connect(random).transferFrom(escrow.target, random.address, AMOUNT),
      ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientAllowance");
      expect(await usdc.balanceOf(escrow.target)).to.equal(contractBefore);
      expect(await usdc.balanceOf(random.address)).to.equal(randomBefore);
    });

    it("blocks a token callback from releasing a funded escrow reentrantly", async function () {
      const { seller } = await loadFixture(deployFixture);
      const ReentrantUSDC = await ethers.getContractFactory("ReentrantUSDC");
      const token: any = await ReentrantUSDC.deploy();
      await token.waitForDeployment();

      const EscrowAI = await ethers.getContractFactory("EscrowAI");
      const escrow: any = await EscrowAI.deploy(await token.getAddress());
      await escrow.waitForDeployment();

      const ReentrantBuyer = await ethers.getContractFactory("ReentrantBuyer");
      const buyer: any = await ReentrantBuyer.deploy(escrow.target, token.target);
      await buyer.waitForDeployment();
      await token.setReentryTarget(buyer.target);
      await token.mint(buyer.target, AMOUNT);

      const deadline = (await time.latest()) + DEADLINE_OFFSET;
      const escrowId = await buyer.createEscrow.staticCall(seller.address, AMOUNT, deadline);
      await buyer.createEscrow(seller.address, AMOUNT, deadline);
      await buyer.fund(escrowId);

      expect(await buyer.reentryAttempts()).to.equal(1);
      expect((await escrowData(escrow, escrowId)).status).to.equal(1);
      expect(await token.balanceOf(escrow.target)).to.equal(AMOUNT);
      expect(await token.balanceOf(seller.address)).to.equal(0);
    });
  });
});
