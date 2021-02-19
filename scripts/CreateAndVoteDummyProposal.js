
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];
    const alice = addresses[1];
    const bob = addresses[2];
    const cecile = addresses[3];

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);
    const govWithSigner = gov.connect(accounts[0]);
    let tx;
    tx = await govWithSigner.propose(
        ["0x0000000000000000000000000000000000000000"],
        [0],
        [""],
        [0x0],
        "dummy proposal"
    );
    await tx.wait();
    console.log((await gov.queryFilter("ProposalCreated"))[0].args)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });