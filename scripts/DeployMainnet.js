
const hre = require("hardhat");
const ethers = hre.ethers;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const { saveContractAddress, clearContractAddress} = require('./utils/SaveContractAddress');

async function main(accountIndex) {

    // Compile our Contracts, just in case
    await hre.run('compile');

    await clearContractAddress();

    const accounts = await ethers.getSigners();

    if (accountIndex == null) {
        accountIndex = 0;
    }
    
    console.log("accountIndex: ", accountIndex);
    
    const tokenRecipient = accounts[accountIndex].address;
    const timeLockAdmin = accounts[accountIndex].address;
    const guardian = accounts[accountIndex].address;

    console.log("token recipient: ", tokenRecipient)

    // This gets the contract from 
    const Token = await ethers.getContractFactory("USF");
    const token = await Token.deploy(tokenRecipient);
    await token.deployed();
    await token.deployTransaction.wait();
    await saveContractAddress("USF", token.address)

    // Deploy Timelock
    const networkId = (await ethers.provider.getNetwork()).chainId;
    const delay = 60;
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(timeLockAdmin, delay);
    await timelock.deployed();
    await timelock.deployTransaction.wait();
    await saveContractAddress("Timelock", timelock.address)

    // Deploy Governance
    const Gov = await ethers.getContractFactory("GovernorAlpha");
    const gov = await Gov.deploy(timelock.address, token.address, guardian);
    await gov.deployed();
    await gov.deployTransaction.wait();
    await saveContractAddress("GovernorAlpha", gov.address)

    // Deploy Governable
    const Govable = await ethers.getContractFactory("Governable");
    const govable = await Govable.deploy(timelock.address);
    await govable.deployed();
    await govable.deployTransaction.wait();
    await saveContractAddress("Governable", govable.address)


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