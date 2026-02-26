const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EAIGold", function () {
    let goldToken;
    let owner, user1, user2;

    const GOLD_PRICE = 580_000_000_000_000n; // 0.00058 ETH in wei

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const EAIGold = await ethers.getContractFactory("EAIGold");
        goldToken = await EAIGold.deploy(owner.address);
    });

    // ─── mintGold ─────────────────────────────────────────────────────────────

    describe("mintGold", function () {
        it("should mint correct GOLD for given ETH", async function () {
            const ethAmount = ethers.parseEther("0.00058"); // = 1 GOLD
            await goldToken.connect(user1).mintGold({ value: ethAmount });
            const balance = await goldToken.balanceOf(user1.address);
            expect(balance).to.equal(ethers.parseEther("1"));
        });

        it("should mint proportional GOLD for larger ETH amounts", async function () {
            const ethAmount = ethers.parseEther("1"); // ~1724.13 GOLD
            await goldToken.connect(user1).mintGold({ value: ethAmount });
            const balance = await goldToken.balanceOf(user1.address);
            // 1e18 (1 ETH in wei) * 1e18 / 580_000_000_000_000 = ~1724137931034482758620
            const expected = (ethAmount * BigInt(1e18)) / GOLD_PRICE;
            expect(balance).to.equal(expected);
        });

        it("should emit GoldMinted event", async function () {
            const ethAmount = ethers.parseEther("0.5");
            const expected = (ethAmount * BigInt(1e18)) / GOLD_PRICE;
            await expect(goldToken.connect(user1).mintGold({ value: ethAmount }))
                .to.emit(goldToken, "GoldMinted")
                .withArgs(user1.address, ethAmount, expected);
        });

        it("should revert with 0 ETH", async function () {
            await expect(
                goldToken.connect(user1).mintGold({ value: 0 })
            ).to.be.revertedWith("EAIGold: must send ETH");
        });

        it("should accumulate ETH in contract", async function () {
            const ethAmount = ethers.parseEther("0.5");
            await goldToken.connect(user1).mintGold({ value: ethAmount });
            const contractBalance = await ethers.provider.getBalance(await goldToken.getAddress());
            expect(contractBalance).to.equal(ethAmount);
        });
    });

    // ─── withdrawETH ──────────────────────────────────────────────────────────

    describe("withdrawETH", function () {
        beforeEach(async function () {
            await goldToken.connect(user1).mintGold({ value: ethers.parseEther("1") });
        });

        it("should withdraw all ETH to specified address", async function () {
            const contractAddr = await goldToken.getAddress();
            const contractBal = await ethers.provider.getBalance(contractAddr);
            expect(contractBal).to.equal(ethers.parseEther("1"));

            const ownerBalBefore = await ethers.provider.getBalance(owner.address);
            const tx = await goldToken.connect(owner).withdrawETH(owner.address);
            const receipt = await tx.wait();
            const gasCost = receipt.gasUsed * receipt.gasPrice;

            const ownerBalAfter = await ethers.provider.getBalance(owner.address);
            expect(ownerBalAfter).to.equal(ownerBalBefore + ethers.parseEther("1") - gasCost);

            const contractBalAfter = await ethers.provider.getBalance(contractAddr);
            expect(contractBalAfter).to.equal(0);
        });

        it("should emit ETHWithdrawn event", async function () {
            await expect(goldToken.connect(owner).withdrawETH(owner.address))
                .to.emit(goldToken, "ETHWithdrawn")
                .withArgs(owner.address, ethers.parseEther("1"));
        });

        it("should revert for non-owner", async function () {
            await expect(
                goldToken.connect(user1).withdrawETH(user1.address)
            ).to.be.reverted;
        });

        it("should revert when no ETH to withdraw", async function () {
            await goldToken.connect(owner).withdrawETH(owner.address);
            await expect(
                goldToken.connect(owner).withdrawETH(owner.address)
            ).to.be.revertedWith("EAIGold: no ETH to withdraw");
        });
    });

    // ─── ERC-20 standard operations ──────────────────────────────────────────

    describe("ERC-20 operations", function () {
        beforeEach(async function () {
            await goldToken.connect(user1).mintGold({ value: ethers.parseEther("0.58") }); // 1000 GOLD
        });

        it("should transfer GOLD between users", async function () {
            const amount = ethers.parseEther("100");
            await goldToken.connect(user1).transfer(user2.address, amount);
            expect(await goldToken.balanceOf(user2.address)).to.equal(amount);
        });

        it("should approve and transferFrom", async function () {
            const amount = ethers.parseEther("50");
            await goldToken.connect(user1).approve(user2.address, amount);
            expect(await goldToken.allowance(user1.address, user2.address)).to.equal(amount);

            await goldToken.connect(user2).transferFrom(user1.address, user2.address, amount);
            expect(await goldToken.balanceOf(user2.address)).to.equal(amount);
        });

        it("should have correct name and symbol", async function () {
            expect(await goldToken.name()).to.equal("EAI Gold");
            expect(await goldToken.symbol()).to.equal("GOLD");
        });

        it("should have 18 decimals", async function () {
            expect(await goldToken.decimals()).to.equal(18);
        });
    });
});
