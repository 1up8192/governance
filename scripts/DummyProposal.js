
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');

async function getProposalState(gov, proposalId) {
    const state = await gov.state(proposalId);
    let stateString;
    switch (state.toString()) {
        case "0":
            stateString = "Pending";
            break;
        case "1":
            stateString = "Active";
            break;
        case "2":
            stateString = "Canceled";
            break;
        case "3":
            stateString = "Defeated";
            break;
        case "4":
            stateString = "Succeeded";
            break;
        case "5":
            stateString = "Queued";
            break;
        case "6":
            stateString = "Expired";
            break;
        case "7":
            stateString = "Executed";
            break;
        default:
            stateString = "Unknown";
            break;
    }
    return stateString;
}

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

    const govWithSigner2 = gov.connect(accounts[2]);
    tx = await govWithSigner2.castVote(proposalId, true);
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