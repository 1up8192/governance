
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../artifacts/ContractAddresses.json");
const BigNumber = ethers.BigNumber;
// const USF = artifacts.require("USF");



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
}

module.exports = {
    distributeTokens: main
}