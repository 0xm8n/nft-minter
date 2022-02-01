import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress = process.env.CONTRACT || "";

const checkLoop = 3000; // millisecond to loop check mint open
const waitTime = 100; // number of loop to check, overall = checkSec*waitTime (eg. 3*100 = 300 second = 5 min)
const wantMint = 1;

async function main() {
  let isOpen = false;
  // change contract factory and address, download its from etherscan then compiles/deploy to ropsten for test
  const NFTContract = await ethers.getContractFactory("LivesOfAsuna");
  // contract address from etherscan
  const nftContract = await NFTContract.attach(contractAddress);

  // mint price, must check function name from the contract and update it
  const mintPrice = await nftContract.price();

  let maxmint = ethers.BigNumber.from(0);
  let mintNFT;
  // this contract use publicListMaxMint to check if public mint enable.
  // must check function name and logic from the contract and update it
  for (let index = 0; index < waitTime; index++) {
    maxmint = await nftContract.publicListMaxMint();
    if (maxmint.toNumber() > 0) {
      isOpen = true;
      console.log("Public mint is OPEN !!!");
      break;
    } else {
      console.log("Public mint is CLOSE");
      isOpen = false;
    }
    await new Promise((resolve) => setTimeout(resolve, checkLoop));
  }
  if (isOpen) {
    // eslint-disable-next-line prettier/prettier
    console.log("### Send public mint for", wantMint, "at price", ethers.utils.formatEther(mintPrice));
    mintNFT = await nftContract.mintPublic(wantMint, {
      value: mintPrice,
    });
  }
  console.log(" ");
  console.log("mint txn:", mintNFT || "no data");
  if (mintNFT) {
    const mintReciept = await mintNFT.wait();
    console.log(" ");
    console.log("mint result:", mintReciept || "no data");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
