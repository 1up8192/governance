
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
    let tx;
    tx = await govWithSigner0.propose(
        ["0x0000000000000000000000000000000000000000"],
        [0],
        [""],
        [0x0],
        "dummy proposal"
    );
    await tx.wait();
    const events = await gov.queryFilter("ProposalCreated");
    const proposalId = events[events.length - 1].args.id;
    console.log("accpunt 0 created proposal id: ", proposalId.toString());
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    await advanceBlock();

    const govWithSigner1 = gov.connect(accounts[1]);
    tx = await govWithSigner1.castVote(proposalId, true);
    await tx.wait();
    console.log("accpunt 1 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    //delegated vote
    const govWithSigner4 = gov.connect(accounts[4]);
    tx = await govWithSigner4.castVote(proposalId, true);
    await tx.wait();
    console.log("accpunt 2 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    for (let index = 0; index < 6; index++) {
        await advanceBlock();
    }

    tx = await govWithSigner0.queue(proposalId);
    await tx.wait();
    console.log("proposal queued");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    advanceTimeAndBlock(3 * days);

    tx = await govWithSigner0.execute(proposalId);
    await tx.wait();
    console.log("proposal executed");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });