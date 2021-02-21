
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

    const governable = await ethers.getContractAt("Governable", contractAddress.Governable);
    const xValue = await governable.getX();

    const calldata = governable.interface.encodeFunctionData("setX", [xValue.add(1)]);

    console.log(`governable value before proposal executed: ${xValue.toString()}, expected value to be set: ${xValue.add(1).toString()}`);
    console.log("calldata:", calldata);
    

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);
    const govWithSigner0 = gov.connect(accounts[0]);
    let tx;
    tx = await govWithSigner0.propose(
        [governable.address],
        [0],
        [""],
        [calldata],
        "mock contract proposal"
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

    tx = await govWithSigner0.execute(proposalId, { gasLimit: 500000 });
    await tx.wait();
    console.log("proposal executed");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    const xValue2 = await governable.getX();

    console.log(`governable value after proposal executed: ${xValue2.toString()}`);


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });