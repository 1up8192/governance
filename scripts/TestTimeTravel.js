
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const BigNumber = ethers.BigNumber;

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    let latestBlock = await web3.eth.getBlock("latest");
    console.log("block number at start", latestBlock.number)
    console.log("block time at start", latestBlock.timestamp);
    await advanceTime(100);
    latestBlock = await web3.eth.getBlock("latest");
    console.log("block number after advance time 100 s", latestBlock.number)
    console.log("block time after advance time 100 s", latestBlock.timestamp);
    await advanceBlock();
    latestBlock = await web3.eth.getBlock("latest");
    console.log("block number after advance block", latestBlock.number)
    console.log("block time after advance block", latestBlock.timestamp);
    await advanceTimeAndBlock(100);
    latestBlock = await web3.eth.getBlock("latest");
    console.log("block number after advance time and block 100s", latestBlock.number)
    console.log("block time after advance block 100s", latestBlock.timestamp);
    await advanceTimeAndBlock(1*days);
    latestBlock = await web3.eth.getBlock("latest");
    console.log("block number after advance time and block 1 day", latestBlock.number)
    console.log("block time after advance block 1 day", latestBlock.timestamp);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });