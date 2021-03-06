
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddresses = require("../ContractAddresses.json");
const BigNumber = ethers.BigNumber;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const usf = await ethers.getContractAt("USF", contractAddresses.USF);
    const usfWithSigner0 = usf.connect(accounts[0]);
    let tx;
    tx = await usfWithSigner0.delegate(addresses[0], { gasLimit: 150000 });
    await tx.wait();
    
    tx = await usfWithSigner0.transfer(addresses[1], ethers.utils.parseEther("350000"), { gasLimit: 150000 });
    await tx.wait();
    const usfWithSigner1 = usf.connect(accounts[1]);
    tx = await usfWithSigner1.delegate(addresses[1], { gasLimit: 150000 });
    await tx.wait();
    
    tx = await usfWithSigner0.transfer(addresses[2], ethers.utils.parseEther("50000"), { gasLimit: 150000 });
    await tx.wait();
    const usfWithSigner2 = usf.connect(accounts[2]);
    tx = await usfWithSigner2.delegate(addresses[2], { gasLimit: 150000 });
    await tx.wait();
    
    tx = await usfWithSigner0.transfer(addresses[3], ethers.utils.parseEther("200000"), { gasLimit: 150000 });
    await tx.wait();
    const usfWithSigner3 = usf.connect(accounts[3]);
    //actually delegates to a different account
    tx = await usfWithSigner3.delegate(addresses[4], { gasLimit: 150000 });
    await tx.wait();

    tx = await usfWithSigner0.transfer(contractAddresses.GnosisSafe, ethers.utils.parseEther("1000000"), { gasLimit: 150000 });
    await tx.wait();

    tx = await usfWithSigner0.transfer(contractAddresses.GnosisSafe, ethers.utils.parseEther("1000000"), { gasLimit: 150000 });
    await tx.wait();

    let index = 0;
    for await (let balance of addresses.slice(0, 5).map(async address => usf.balanceOf(address))) {
        console.log(`account ${index} balance: ${balance}`)
        index++;
    }
    console.log(`gnosis safe balance: ${await usf.balanceOf(contractAddresses.GnosisSafe)}`)
    console.log(`gnosis address: ${contractAddresses.GnosisSafe}`)
    index = 0;
    for await (let votes of addresses.slice(0, 5).map(async address => usf.getCurrentVotes(address))) {
        console.log(`account ${index} votes: ${votes}`)
        index++;
    }
    console.log(`gnosis safe votes: ${await usf.getCurrentVotes(contractAddresses.GnosisSafe)}`)

}

/* main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); */

module.exports = {
    distributeTokens: main
}