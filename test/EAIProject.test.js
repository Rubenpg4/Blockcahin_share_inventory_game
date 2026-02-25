const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EAIProject", function () {
  let eaiProject;
  let admin, minter, seller, buyer, other;
  const TOKEN_ID = 1;
  const TOKEN_AMOUNT = 10;
  const TOKEN_URI = "ipfs://QmExampleCID/metadata.json";
  const PRICE_PER_UNIT = ethers.parseEther("0.01");

  beforeEach(async function () {
    [admin, minter, seller, buyer, other] = await ethers.getSigners();

    const EAIProject = await ethers.getContractFactory("EAIProject");
    eaiProject = await EAIProject.deploy(admin.address);

    const MINTER_ROLE = await eaiProject.MINTER_ROLE();
    await eaiProject.connect(admin).grantRole(MINTER_ROLE, minter.address);

    // Mint tokens to seller
    await eaiProject.connect(minter).mint(seller.address, TOKEN_ID, TOKEN_AMOUNT, TOKEN_URI, "0x");
  });

  // ─── Mint ──────────────────────────────────────────────────────────────────

  describe("Mint", function () {
    it("should mint tokens to an address", async function () {
      expect(await eaiProject.balanceOf(seller.address, TOKEN_ID)).to.equal(TOKEN_AMOUNT);
    });

    it("should set the correct token URI", async function () {
      expect(await eaiProject.uri(TOKEN_ID)).to.equal(TOKEN_URI);
    });

    it("should emit TokenMinted event", async function () {
      await expect(
        eaiProject.connect(minter).mint(other.address, 2, 5, "ipfs://QmOther/metadata.json", "0x")
      )
        .to.emit(eaiProject, "TokenMinted")
        .withArgs(other.address, 2, 5, "ipfs://QmOther/metadata.json");
    });

    it("should revert if caller lacks MINTER_ROLE", async function () {
      await expect(
        eaiProject.connect(other).mint(other.address, 3, 1, TOKEN_URI, "0x")
      ).to.be.reverted;
    });
  });

  // ─── listForSale ──────────────────────────────────────────────────────────

  describe("listForSale", function () {
    beforeEach(async function () {
      await eaiProject.connect(seller).setApprovalForAll(await eaiProject.getAddress(), true);
    });

    it("should create an active listing", async function () {
      await eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT);
      const listing = await eaiProject.listings(seller.address, TOKEN_ID);
      expect(listing.active).to.be.true;
      expect(listing.amount).to.equal(TOKEN_AMOUNT);
      expect(listing.pricePerUnit).to.equal(PRICE_PER_UNIT);
    });

    it("should emit ItemListed event", async function () {
      await expect(
        eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT)
      )
        .to.emit(eaiProject, "ItemListed")
        .withArgs(seller.address, TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT);
    });

    it("should revert if amount is zero", async function () {
      await expect(
        eaiProject.connect(seller).listForSale(TOKEN_ID, 0, PRICE_PER_UNIT)
      ).to.be.revertedWith("EAIProject: amount must be greater than zero");
    });

    it("should revert if price is zero", async function () {
      await expect(
        eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, 0)
      ).to.be.revertedWith("EAIProject: price must be greater than zero");
    });

    it("should revert if seller has insufficient balance", async function () {
      await expect(
        eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT + 1, PRICE_PER_UNIT)
      ).to.be.revertedWith("EAIProject: insufficient token balance");
    });

    it("should revert if contract not approved", async function () {
      await eaiProject.connect(seller).setApprovalForAll(await eaiProject.getAddress(), false);
      await expect(
        eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT)
      ).to.be.revertedWith("EAIProject: contract not approved to manage tokens");
    });
  });

  // ─── cancelListing ────────────────────────────────────────────────────────

  describe("cancelListing", function () {
    beforeEach(async function () {
      await eaiProject.connect(seller).setApprovalForAll(await eaiProject.getAddress(), true);
      await eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT);
    });

    it("should deactivate the listing", async function () {
      await eaiProject.connect(seller).cancelListing(TOKEN_ID);
      const listing = await eaiProject.listings(seller.address, TOKEN_ID);
      expect(listing.active).to.be.false;
    });

    it("should emit ListingCancelled event", async function () {
      await expect(eaiProject.connect(seller).cancelListing(TOKEN_ID))
        .to.emit(eaiProject, "ListingCancelled")
        .withArgs(seller.address, TOKEN_ID);
    });

    it("should revert if no active listing", async function () {
      await eaiProject.connect(seller).cancelListing(TOKEN_ID);
      await expect(
        eaiProject.connect(seller).cancelListing(TOKEN_ID)
      ).to.be.revertedWith("EAIProject: no active listing");
    });
  });

  // ─── buyItem ──────────────────────────────────────────────────────────────

  describe("buyItem", function () {
    const BUY_AMOUNT = 3;
    let totalPrice;

    beforeEach(async function () {
      await eaiProject.connect(seller).setApprovalForAll(await eaiProject.getAddress(), true);
      await eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT);
      totalPrice = PRICE_PER_UNIT * BigInt(BUY_AMOUNT);
    });

    it("should transfer tokens to buyer", async function () {
      await eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, { value: totalPrice });
      expect(await eaiProject.balanceOf(buyer.address, TOKEN_ID)).to.equal(BUY_AMOUNT);
    });

    it("should deduct tokens from seller", async function () {
      await eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, { value: totalPrice });
      expect(await eaiProject.balanceOf(seller.address, TOKEN_ID)).to.equal(TOKEN_AMOUNT - BUY_AMOUNT);
    });

    it("should emit ItemSold event", async function () {
      await expect(
        eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, { value: totalPrice })
      )
        .to.emit(eaiProject, "ItemSold")
        .withArgs(seller.address, buyer.address, TOKEN_ID, BUY_AMOUNT, totalPrice);
    });

    it("should accumulate marketplace fees", async function () {
      await eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, { value: totalPrice });
      const fee = (totalPrice * 250n) / 10000n;
      expect(await eaiProject.accumulatedFees()).to.equal(fee);
    });

    it("should revert if listing is not active", async function () {
      await eaiProject.connect(seller).cancelListing(TOKEN_ID);
      await expect(
        eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, { value: totalPrice })
      ).to.be.revertedWith("EAIProject: listing not active");
    });

    it("should revert if incorrect ether amount sent", async function () {
      await expect(
        eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, BUY_AMOUNT, {
          value: totalPrice - 1n,
        })
      ).to.be.revertedWith("EAIProject: incorrect ether amount");
    });

    it("should deactivate listing when all tokens are bought", async function () {
      const fullPrice = PRICE_PER_UNIT * BigInt(TOKEN_AMOUNT);
      await eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, TOKEN_AMOUNT, { value: fullPrice });
      const listing = await eaiProject.listings(seller.address, TOKEN_ID);
      expect(listing.active).to.be.false;
    });
  });

  // ─── Marketplace fees ────────────────────────────────────────────────────

  describe("withdrawFees", function () {
    it("should allow admin to withdraw accumulated fees", async function () {
      await eaiProject.connect(seller).setApprovalForAll(await eaiProject.getAddress(), true);
      await eaiProject.connect(seller).listForSale(TOKEN_ID, TOKEN_AMOUNT, PRICE_PER_UNIT);
      const totalPrice = PRICE_PER_UNIT * BigInt(TOKEN_AMOUNT);
      await eaiProject.connect(buyer).buyItem(seller.address, TOKEN_ID, TOKEN_AMOUNT, { value: totalPrice });

      const fees = await eaiProject.accumulatedFees();
      await expect(eaiProject.connect(admin).withdrawFees(admin.address))
        .to.emit(eaiProject, "FeesWithdrawn")
        .withArgs(admin.address, fees);

      expect(await eaiProject.accumulatedFees()).to.equal(0);
    });

    it("should revert if no fees accumulated", async function () {
      await expect(
        eaiProject.connect(admin).withdrawFees(admin.address)
      ).to.be.revertedWith("EAIProject: no fees to withdraw");
    });
  });

  // ─── supportsInterface ────────────────────────────────────────────────────

  describe("supportsInterface", function () {
    it("should support ERC1155 interface", async function () {
      expect(await eaiProject.supportsInterface("0xd9b67a26")).to.be.true;
    });

    it("should support AccessControl interface", async function () {
      expect(await eaiProject.supportsInterface("0x7965db0b")).to.be.true;
    });
  });
});
