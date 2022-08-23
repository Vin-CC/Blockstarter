// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  const amount = hre.ethers.utils.parseEther("1");

  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy();

  const tx = await campaignFactory.deployed();


  // copy the contract JSON file to front-end
  fs.copyFileSync(
    path.join(__dirname, "../artifacts/contracts/CampaignFactory.sol/CampaignFactory.json"), //source
    path.join(__dirname, "../src/contracts/CampaignFactory.json") // destination
  );

  fs.copyFileSync(
    path.join(__dirname, "../artifacts/contracts/Campaign.sol/Campaign.json"), //source
    path.join(__dirname, "../src/contracts/Campaign.json") // destination
  );

  console.log("CampaignFactory contract deployed !");
  console.log("Address : ", campaignFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
