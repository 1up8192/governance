
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);

    const timelock = await ethers.getContractAt("Timelock", contractAddress.Timelock);
    const calldata = timelock.interface.encodeFunctionData("setPendingAdmin", [gov.address]);

    const timelockWithSigner0 = timelock.connect(accounts[0]);

    let waitTime;
    const networkId = (await ethers.provider.getNetwork()).chainId;

    if(networkId == 1337){
        waitTime = 3 * days;
    } else if(networkId == 3) {
        waitTime = 100;
    }

    const blockTimestamp = (await ethers.provider.getBlock()).timestamp + waitTime;

    let tx;
    tx = await timelockWithSigner0.queueTransaction(timelock.address, 0, "", calldata, blockTimestamp);
    await tx.wait();

    if(networkId == 1337){
        await advanceTimeAndBlock(waitTime);
    } else if(networkId == 3) {
        await waitSeconds(waitTime)
    }

    tx = await timelockWithSigner0.executeTransaction(timelock.address, 0, "", calldata, blockTimestamp, { gasLimit: 500000 });
    await tx.wait();

    const govWithSigner0 = gov.connect(accounts[0]);
    tx = await govWithSigner0.__acceptAdmin();
    await tx.wait();

    console.log("Timelock admin address should be GovernorAlpha contract address")
    console.log("Timelock admin:", await timelock.admin())
    console.log("GovernorAlpha contract address:", gov.address)


}

/* main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); */

module.exports = {
    setTimelockAdmin: main
}