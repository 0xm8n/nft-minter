import { ethers } from "hardhat";

async function main() {
  const DeployContract = await ethers.getContractFactory("Karafuru");
  const deployContract = await DeployContract.deploy();

  await deployContract.deployed();

  console.log("DeployContract deployed to:", deployContract.address);
  // console.log("Deployer address:", owner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
