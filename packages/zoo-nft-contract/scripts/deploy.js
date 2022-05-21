// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ZooNftCollection = await hre.ethers.getContractFactory(
    "ZooNftCollection"
  );
  const zooNftCollection = await ZooNftCollection.deploy();

  await zooNftCollection.deployed();

  console.log("ZooNftCollection deployed to:", zooNftCollection.address);

  const ZooNftMarketplace = await hre.ethers.getContractFactory(
    "ZooNftMarketplace"
  );
  const zooNftMarketplace = await ZooNftMarketplace.deploy(
    zooNftCollection.address
  );
  await zooNftMarketplace.deployed();
  console.log("ZooNftMarketplace deployed to:", zooNftMarketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
