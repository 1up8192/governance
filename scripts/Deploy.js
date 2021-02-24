
const hre = require("hardhat");
const ethers = hre.ethers;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const saveAddress = require('./utils/SaveContractAddress');

async function main({ tokenRecipient, timeLockAdmin, guardian }) {

    // Compile our Contracts, just in case
    await hre.run('compile');

    const accounts = await ethers.getSigners();

    if (tokenRecipient == null) {
        tokenRecipient = accounts[0].address;
    }
    if (timeLockAdmin == null) {
        timeLockAdmin = accounts[0].address;
    }
    if (guardian == null) {
        guardian = accounts[0].address;
    }

    console.log("token recipient: ", tokenRecipient)

    // This gets the contract from 
    const Token = await ethers.getContractFactory("USF");
    const token = await Token.deploy(tokenRecipient);
    await token.deployed();
    await token.deployTransaction.wait();
    saveAddress("USF", token.address)

    // Deploy Timelock
    const networkId = (await ethers.provider.getNetwork()).chainId;
    let delay;
    if(networkId == 3){
        delay = 0;
    } else {
        delay = 2 * days;
    }
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(timeLockAdmin, delay);
    await timelock.deployed();
    await timelock.deployTransaction.wait();
    saveAddress("Timelock", timelock.address)

    // Deploy Governance
    const Gov = await ethers.getContractFactory("GovernorAlpha");
    const gov = await Gov.deploy(timelock.address, token.address, guardian);
    await gov.deployed();
    await gov.deployTransaction.wait();
    saveAddress("GovernorAlpha", gov.address)

     // Deploy Governable
     const Govable = await ethers.getContractFactory("Governable");
     const govable = await Govable.deploy(timelock.address);
     await govable.deployed();
     await govable.deployTransaction.wait();
     saveAddress("Governable", govable.address)


    console.log(`Token deployed to: ${token.address}`);
    console.log(`TimeLock deployed to: ${timelock.address}`);
    console.log(`GovernorAlpha deployed to: ${gov.address}`)
    console.log(`Governable deployed to: ${govable.address}`)

    const initialBalance = await token.balanceOf(tokenRecipient);
    console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient}`);
}



module.exports = {
    deploy: main
}