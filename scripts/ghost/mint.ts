import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress = process.env.CONTRACT || "";
const checkLoop = 3000; // millisecond to loop check mint open
const waitTime = 100; // number of loop to check, overall = checkSec*waitTime (eg. 3*100 = 300 second = 5 min)
let wantMint = ethers.BigNumber.from(3);

async function main() {
  let isOpen = false;
  // change contract factory and address, download its from etherscan then compiles/deploy to ropsten for test
  const NFTContract = await ethers.getContractFactory("GhostsProject");
  // contract address from etherscan
  const nftContract = await NFTContract.attach(contractAddress);

  // mint price, must check function name from the contract and update it
  const mintPrice = await nftContract.ghostPrice();
  const maxmint = await nftContract.maxPurchasePerMint();
  wantMint = wantMint > maxmint ? maxmint : wantMint;

  let mintNFT;
  // this contract use publicListMaxMint to check if public mint enable.
  // must check function name and logic from the contract and update it
  for (let index = 0; index < waitTime; index++) {
    isOpen = await nftContract.saleIsActive();
    if (isOpen) {
      console.log("Public mint is OPEN !!!");
      break;
    } else {
      console.log("Public mint is CLOSE");
    }
    await new Promise((resolve) => setTimeout(resolve, checkLoop));
  }
  if (isOpen) {
    // eslint-disable-next-line prettier/prettier
    console.log("### Send public mint for", wantMint, "at price", ethers.utils.formatEther(mintPrice));
    mintNFT = await nftContract.mintGhost(wantMint, {
      value: mintPrice.mul(wantMint),
    });

    console.log(" ");
    console.log("mint txn:", mintNFT);
    if (mintNFT) {
      const mintReciept = await mintNFT.wait();
      console.log(" ");
      console.log("mint result:", mintReciept);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
