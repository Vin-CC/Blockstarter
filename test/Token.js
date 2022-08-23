const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const NAME = "test";
const SYMBOL = "TST";
const DECIMALS = 16;
const AMOUNT = ethers.utils.parseEther("1");

describe("Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // Contracts are deployed using the first signer/account by default
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(NAME, SYMBOL, DECIMALS, AMOUNT);

    return { token, NAME, SYMBOL, DECIMALS, AMOUNT, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(await token.getName()).to.equal(NAME);
    });
  });
});
