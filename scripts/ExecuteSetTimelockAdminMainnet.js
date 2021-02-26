
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');

async function main(accountIndex, eta) {

    //just so ganache testing gets new timestamp
    const chainId = (await ethers.provider.getNetwork()).chainId;
    if(chainId == 1337){
        advanceBlock();
    }

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

    let tx;
    tx = await timelockWithSigner0.executeTransaction(timelock.address, 0, "", calldata, ethers.BigNumber.from(eta), { gasLimit: 500000 });
    await tx.wait();

    const govWithSigner0 = gov.connect(accounts[accountIndex]);
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
    executeSetTimelockAdmin: main
}