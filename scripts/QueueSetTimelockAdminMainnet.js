
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');

async function main(accountIndex) {

    if (accountIndex == null) {
        accountIndex = 0;
    }

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[accountIndex];
    const owner = addresses[accountIndex];

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);

    const timelock = await ethers.getContractAt("Timelock", contractAddress.Timelock);
    const calldata = timelock.interface.encodeFunctionData("setPendingAdmin", [gov.address]);

    const timelockWithSigner0 = timelock.connect(accounts[accountIndex]);

    const waitTime = (await timelock.delay()).add(20); //extra time has to be added baceuse of the possible time elapsed from getting the timestamp and sendign the tx 

    console.log(`waitTime: ${waitTime.toString()} second, you have to wait this long before executing`);

    const eta = ethers.BigNumber.from((await ethers.provider.getBlock()).timestamp).add(waitTime);

    console.log(`original eta: ${eta.toString()}, write this down, you will need it for execution!`)

    let tx;
    tx = await timelockWithSigner0.queueTransaction(timelock.address, 0, "", calldata, eta);
    await tx.wait();

    console.log("Timelock 'setPendingAdmin' operation Queued")
}

/* main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); */

module.exports = {
    queueSetTimelockAdmin: main
}