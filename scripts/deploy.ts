import { ethers } from "hardhat";

async function main() {
  const DeployContract = await ethers.getContractFactory("LivesOfAsuna");
  const deployContract = await DeployContract.deploy(
    ["0x94021138093918b6E0DDb275272bD638C22df912"],
    ["1"],
    "Lives of Asuna",
    "LOA",
    "3",
    "0",
    "9900",
    "100",
    "80000000000000000"
  );

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
