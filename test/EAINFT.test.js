const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EAINFT", function () {
    let nftContract, goldToken;
    let owner, seller, buyer, other;
    const TOKEN_URI = "http://localhost:3333/nft-100.json";
    const PRICE = ethers.parseEther("50"); // 50 GOLD

    beforeEach(async function () {
        [owner, seller, buyer, other] = await ethers.getSigners();

        // Deploy GOLD token
        const EAIGold = await ethers.getContractFactory("EAIGold");
        goldToken = await EAIGold.deploy(owner.address);

        // Deploy EAINFT
        const EAINFT = await ethers.getContractFactory("EAINFT");
        nftContract = await EAINFT.deploy(owner.address, await goldToken.getAddress());

        // Give buyer some GOLD (1 ETH → ~1724 GOLD)
        await goldToken.connect(buyer).mintGold({ value: ethers.parseEther("1") });
    });

    // ─── Mint ────────────────────────────────────────────────────────────────

    describe("mintRelic", function () {
        it("should mint an NFT with auto-incremented ID starting at 100", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            expect(await nftContract.ownerOf(100)).to.equal(seller.address);
        });

        it("should auto-increment token IDs", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(owner).mintRelic(buyer.address, "http://localhost:3333/nft-101.json");
            expect(await nftContract.ownerOf(100)).to.equal(seller.address);
            expect(await nftContract.ownerOf(101)).to.equal(buyer.address);
        });

        it("should set the correct token URI", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            expect(await nftContract.tokenURI(100)).to.equal(TOKEN_URI);
        });

        it("should emit RelicMinted event", async function () {
            await expect(nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI))
                .to.emit(nftContract, "RelicMinted")
                .withArgs(seller.address, 100, TOKEN_URI);
        });

        it("should revert if caller is not owner", async function () {
            await expect(
                nftContract.connect(other).mintRelic(other.address, TOKEN_URI)
            ).to.be.reverted;
        });

        it("should track all minted IDs", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(owner).mintRelic(buyer.address, "uri2");
            const ids = await nftContract.getAllMintedIds();
            expect(ids.length).to.equal(2);
            expect(ids[0]).to.equal(100);
            expect(ids[1]).to.equal(101);
        });
    });

    // ─── listNFTForSale ──────────────────────────────────────────────────────

    describe("listNFTForSale", function () {
        beforeEach(async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
        });

        it("should create an active listing", async function () {
            await nftContract.connect(seller).listNFTForSale(100, PRICE);
            const listing = await nftContract.nftListings(100);
            expect(listing.active).to.be.true;
            expect(listing.price).to.equal(PRICE);
            expect(listing.seller).to.equal(seller.address);
        });

        it("should emit NFTListedForSale event", async function () {
            await expect(nftContract.connect(seller).listNFTForSale(100, PRICE))
                .to.emit(nftContract, "NFTListedForSale")
                .withArgs(seller.address, 100, PRICE);
        });

        it("should revert if caller is not the owner of the NFT", async function () {
            await expect(
                nftContract.connect(buyer).listNFTForSale(100, PRICE)
            ).to.be.revertedWith("EAINFT: caller is not the owner");
        });

        it("should revert if price is zero", async function () {
            await expect(
                nftContract.connect(seller).listNFTForSale(100, 0)
            ).to.be.revertedWith("EAINFT: price must be greater than zero");
        });

        it("should revert if contract not approved", async function () {
            // Mint a new one without approving
            await nftContract.connect(owner).mintRelic(other.address, "uri2");
            await expect(
                nftContract.connect(other).listNFTForSale(101, PRICE)
            ).to.be.revertedWith("EAINFT: contract not approved to transfer NFT");
        });
    });

    // ─── buyNFT ──────────────────────────────────────────────────────────────

    describe("buyNFT", function () {
        beforeEach(async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
            await nftContract.connect(seller).listNFTForSale(100, PRICE);

            // Buyer approves GOLD spend
            await goldToken.connect(buyer).approve(await nftContract.getAddress(), PRICE);
        });

        it("should transfer NFT to buyer", async function () {
            await nftContract.connect(buyer).buyNFT(100);
            expect(await nftContract.ownerOf(100)).to.equal(buyer.address);
        });

        it("should transfer GOLD to seller (minus fee)", async function () {
            const sellerGoldBefore = await goldToken.balanceOf(seller.address);
            await nftContract.connect(buyer).buyNFT(100);
            const sellerGoldAfter = await goldToken.balanceOf(seller.address);

            const fee = (PRICE * 250n) / 10000n;
            const sellerProceeds = PRICE - fee;
            expect(sellerGoldAfter - sellerGoldBefore).to.equal(sellerProceeds);
        });

        it("should accumulate 2.5% marketplace fees in GOLD", async function () {
            await nftContract.connect(buyer).buyNFT(100);
            const fee = (PRICE * 250n) / 10000n;
            expect(await nftContract.accumulatedFees()).to.equal(fee);
        });

        it("should deactivate listing after purchase", async function () {
            await nftContract.connect(buyer).buyNFT(100);
            const listing = await nftContract.nftListings(100);
            expect(listing.active).to.be.false;
        });

        it("should emit NFTSold event", async function () {
            await expect(nftContract.connect(buyer).buyNFT(100))
                .to.emit(nftContract, "NFTSold")
                .withArgs(seller.address, buyer.address, 100, PRICE);
        });

        it("should revert if listing not active", async function () {
            await nftContract.connect(buyer).buyNFT(100);
            await expect(
                nftContract.connect(other).buyNFT(100)
            ).to.be.revertedWith("EAINFT: listing not active");
        });

        it("should revert if buyer has insufficient GOLD allowance", async function () {
            await goldToken.connect(buyer).approve(await nftContract.getAddress(), 0);
            await expect(
                nftContract.connect(buyer).buyNFT(100)
            ).to.be.reverted;
        });

        it("should revert if buyer tries to buy own NFT", async function () {
            // seller tries to buy their own
            await goldToken.connect(seller).mintGold({ value: ethers.parseEther("1") });
            await goldToken.connect(seller).approve(await nftContract.getAddress(), PRICE);
            await expect(
                nftContract.connect(seller).buyNFT(100)
            ).to.be.revertedWith("EAINFT: cannot buy your own NFT");
        });
    });

    // ─── cancelNFTListing ────────────────────────────────────────────────────

    describe("cancelNFTListing", function () {
        beforeEach(async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
            await nftContract.connect(seller).listNFTForSale(100, PRICE);
        });

        it("should deactivate the listing", async function () {
            await nftContract.connect(seller).cancelNFTListing(100);
            const listing = await nftContract.nftListings(100);
            expect(listing.active).to.be.false;
        });

        it("should emit NFTListingCancelled event", async function () {
            await expect(nftContract.connect(seller).cancelNFTListing(100))
                .to.emit(nftContract, "NFTListingCancelled")
                .withArgs(seller.address, 100);
        });

        it("should revert if no active listing", async function () {
            await nftContract.connect(seller).cancelNFTListing(100);
            await expect(
                nftContract.connect(seller).cancelNFTListing(100)
            ).to.be.revertedWith("EAINFT: no active listing");
        });

        it("should revert if caller is not the NFT owner", async function () {
            await expect(
                nftContract.connect(buyer).cancelNFTListing(100)
            ).to.be.revertedWith("EAINFT: caller is not the owner");
        });
    });

    // ─── withdrawFees ────────────────────────────────────────────────────────

    describe("withdrawFees", function () {
        it("should allow owner to withdraw accumulated GOLD fees", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
            await nftContract.connect(seller).listNFTForSale(100, PRICE);
            await goldToken.connect(buyer).approve(await nftContract.getAddress(), PRICE);
            await nftContract.connect(buyer).buyNFT(100);

            const fees = await nftContract.accumulatedFees();
            const ownerBefore = await goldToken.balanceOf(owner.address);

            await expect(nftContract.connect(owner).withdrawFees(owner.address))
                .to.emit(nftContract, "FeesWithdrawn")
                .withArgs(owner.address, fees);

            expect(await nftContract.accumulatedFees()).to.equal(0);
            const ownerAfter = await goldToken.balanceOf(owner.address);
            expect(ownerAfter - ownerBefore).to.equal(fees);
        });

        it("should revert if no fees accumulated", async function () {
            await expect(
                nftContract.connect(owner).withdrawFees(owner.address)
            ).to.be.revertedWith("EAINFT: no fees to withdraw");
        });
    });

    // ─── getAllActiveNFTListings ──────────────────────────────────────────────

    describe("getAllActiveNFTListings", function () {
        it("should return all active listings", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(owner).mintRelic(seller.address, "uri2");
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 101);
            await nftContract.connect(seller).listNFTForSale(100, PRICE);
            await nftContract.connect(seller).listNFTForSale(101, ethers.parseEther("100"));

            const [tokenIds, sellers, prices] = await nftContract.getAllActiveNFTListings();
            expect(tokenIds.length).to.equal(2);
            expect(tokenIds[0]).to.equal(100);
            expect(tokenIds[1]).to.equal(101);
            expect(sellers[0]).to.equal(seller.address);
            expect(prices[0]).to.equal(PRICE);
        });

        it("should exclude cancelled listings", async function () {
            await nftContract.connect(owner).mintRelic(seller.address, TOKEN_URI);
            await nftContract.connect(seller).approve(await nftContract.getAddress(), 100);
            await nftContract.connect(seller).listNFTForSale(100, PRICE);
            await nftContract.connect(seller).cancelNFTListing(100);

            const [tokenIds] = await nftContract.getAllActiveNFTListings();
            expect(tokenIds.length).to.equal(0);
        });
    });

    // ─── supportsInterface ───────────────────────────────────────────────────

    describe("supportsInterface", function () {
        it("should support ERC721 interface", async function () {
            expect(await nftContract.supportsInterface("0x80ac58cd")).to.be.true;
        });
    });
});
