
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');

async function main() {

    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];
    const alice = addresses[1];
    const bob = addresses[2];
    const cecile = addresses[3];

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);
    const govWithSigner0 = gov.connect(accounts[0]);
    const events = await gov.queryFilter("ProposalCreated");
    const proposalId = events[events.length - 1].args.id;
    console.log("latest proposal id: ", proposalId.toString());
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    let tx;
    tx = await govWithSigner0.cancel(proposalId);
    await tx.wait();
    console.log(`cancel tx executed`);
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });