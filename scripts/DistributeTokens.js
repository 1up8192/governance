
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const BigNumber = ethers.BigNumber;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];
    const alice = addresses[1];
    const bob = addresses[2];
    const cecile = addresses[3];

    const usf = await ethers.getContractAt("USF", contractAddress.USF);
    const usfWithSigner = usf.connect(accounts[0]);
    let tx;
    tx = await usfWithSigner.transfer(alice, ethers.utils.parseEther("350000"));
    await tx.wait();
    tx = await usfWithSigner.transfer(bob, ethers.utils.parseEther("200000"));
    await tx.wait();
    tx = await usfWithSigner.transfer(cecile, ethers.utils.parseEther("50000"));
    await tx.wait();
    let index = 0;
    for await (let balance of addresses.slice(0, 4).map(async address => usf.balanceOf(address))) {
        console.log(`account ${index} balance: ${balance}`)
        index++;
    }
    await advanceBlock();        
    index = 0;
    for await (let votes of addresses.slice(0, 4).map(async address => usf.getCurrentVotes(address))) {
        console.log(`account ${index} votes: ${votes}`)
        index++;
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

module.exports = {
    distributeTokens: main
}