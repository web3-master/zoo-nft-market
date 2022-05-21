const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const zooNftCollection = await ethers.getContract(
    "ZooNftCollection",
    deployer
  );

  await deploy("ZooNftMarketplace", {
    from: deployer,
    args: [zooNftCollection.address],
    log: true,
  });
};
module.exports.tags = ["ZooNftMarketplace"];
