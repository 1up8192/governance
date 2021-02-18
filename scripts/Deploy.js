
const hre = require("hardhat");
const ethers = hre.ethers;

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
    saveAddress("USF", token)

    // Deploy Timelock
    const delay = 172800;
    const Timelock = await ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy(timeLockAdmin, delay);
    await timelock.deployed();
    await timelock.deployTransaction.wait();
    saveAddress("Timelock", timelock)

    // Deploy Governance
    const Gov = await ethers.getContractFactory("GovernorAlpha");
    const gov = await Gov.deploy(timelock.address, token.address, guardian);
    await gov.deployed();
    await gov.deployTransaction.wait();
    saveAddress("GovernorAlpha", gov)

    console.log(`Token deployed to: ${token.address}`);
    console.log(`TimeLock deployed to: ${timelock.address}`);
    console.log(`GovernorAlpha deployed to: ${gov.address}`)

    const initialBalance = await token.balanceOf(tokenRecipient);
    console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient}`);
}

async function saveAddress(name, contract) {
    const fs = require("fs");

    contractAddressesFile = "./artifacts/ContractAddresses.json";

    if (!fs.existsSync(contractAddressesFile)) {
        fs.writeFileSync(
            "./artifacts/ContractAddresses.json",
            JSON.stringify({ [name]: contract.address }, undefined, 2)
        );
    } else {
        const addresses = JSON.parse(fs.readFileSync(contractAddressesFile));
        addresses[name] = contract.address;
        fs.writeFileSync(
            "./artifacts/ContractAddresses.json",
            JSON.stringify(addresses, undefined, 2)
        );
    }
}

module.exports = {
    deploy: main
}