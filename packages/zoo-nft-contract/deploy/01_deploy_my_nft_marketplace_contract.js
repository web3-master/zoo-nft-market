const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const myNftCollection = await ethers.getContract("MyNftCollection", deployer);

  await deploy("MyNftMarketplace", {
    from: deployer,
    args: [myNftCollection.address],
    log: true,
  });
};
module.exports.tags = ["MyNftMarketplace"];
