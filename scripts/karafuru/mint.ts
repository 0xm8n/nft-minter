import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const contractAddress = process.env.CONTRACT || "";
const checkLoop = 1000; // millisecond to loop check mint open
const waitTime = 1800; // number of loop to check, overall = waitTime*checkLoop (eg. 1800*1000 = 1800 second = 30 min)
let wantMint = ethers.BigNumber.from(2);

async function main() {
  let isOpen = false;
  // change contract factory and address, download its from etherscan then compiles/deploy to ropsten for test
  const NFTContract = await ethers.getContractFactory("Karafuru");
  // contract address from etherscan
  const nftContract = await NFTContract.attach(contractAddress);

  // mint price, must check function name from the contract and update it
  const mintPrice = await nftContract.PUBLIC_SALES_START_PRICE();
  const maxmint = await nftContract.MAX_QTY_PER_MINTER();

  // const openTimestamp = ethers.BigNumber.from(1644042315);
  const openTimestamp = await nftContract.publicSalesStartTime();

  wantMint = wantMint > maxmint ? maxmint : wantMint;

  console.log(
    "### Bot will public mint for",
    wantMint,
    "at price",
    ethers.utils.formatEther(mintPrice),
    ". Total",
    ethers.utils.formatEther(wantMint.mul(mintPrice)),
    "ETH"
  );

  let mintNFT;
  // this contract use publicListMaxMint to check if public mint enable.
  // must check function name and logic from the contract and update it
  for (let index = 0; index < waitTime; index++) {
    const currentTimeatamp = ethers.BigNumber.from(
      Math.round(Date.now() / 1000)
    );
    console.log("Open timestamp is", openTimestamp);
    console.log("Current timestamp is", currentTimeatamp);
    isOpen = currentTimeatamp >= openTimestamp;
    // isOpen = await nftContract.isPublicSalesActivated();
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
    mintNFT = await nftContract.publicSalesMint(wantMint, {
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
