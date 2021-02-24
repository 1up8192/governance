
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

    const networkId = (await ethers.provider.getNetwork()).chainId;
    if (networkId == 1337) {
        await advanceBlock();
    }

    const govWithSigner1 = gov.connect(accounts[1]);
    tx = await govWithSigner1.castVote(proposalId, true, { gasLimit: 150000 });
    await tx.wait();
    console.log("accpunt 1 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    //delegated vote
    const govWithSigner4 = gov.connect(accounts[4]);
    tx = await govWithSigner4.castVote(proposalId, true, { gasLimit: 150000 });
    await tx.wait();
    console.log("accpunt 2 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        for (let index = 0; index < 11; index++) {
            await advanceBlock();
        }
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
        await waitSeconds(11*block)
    }


    tx = await govWithSigner0.queue(proposalId, { gasLimit: 150000 });
    await tx.wait();
    console.log("proposal queued");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        await advanceTimeAndBlock(3 * days);
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
        await waitSeconds(block)
    }

    tx = await govWithSigner0.execute(proposalId);
    await tx.wait();
    console.log("proposal executed");
    console.log(`proposal state: ${await getProposalState(gov, proposalId), { gasLimit: 500000 }}`);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });