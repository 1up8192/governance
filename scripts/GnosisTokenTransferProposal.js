
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');
const zeroAddress = "0x0000000000000000000000000000000000000000"

// data for vote signing
let chainId;

async function main() {
    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];
    const alice = addresses[1];
    const bob = addresses[2];
    const cecile = addresses[3];

    chainId = await web3.eth.getChainId();

    const usf = await ethers.getContractAt("USF", contractAddress.USF);

    const transferCalldata = usf.interface.encodeFunctionData("transfer", [addresses[5], ethers.utils.parseEther("50000")]);

    console.log("transferCalldata:", transferCalldata);

    
    const gnosisSafe = await ethers.getContractAt("GnosisSafe", contractAddress.GnosisSafe);
    const nonce = await gnosisSafe.nonce()
    const transactionHash = await gnosisSafe.getTransactionHash(
        usf.address,
        0,
        transferCalldata,
        0,
        0,
        0,
        0,
        zeroAddress,
        zeroAddress,
        nonce
    );

    const signature = "0x000000000000000000000000" + contractAddress.GovernorAlpha.replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01"

    const approveHashCalldata = gnosisSafe.interface.encodeFunctionData("approveHash", [transactionHash]);
    const execTransactionCalldata = gnosisSafe.interface.encodeFunctionData("execTransaction", [
        usf.address,
        0,
        transferCalldata,
        0,
        0,
        0,
        0,
        zeroAddress,
        zeroAddress,
        signature
    ]);


    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);
    const govWithSigner0 = gov.connect(accounts[0]);
    let tx;
    tx = await govWithSigner0.propose(
        [gnosisSafe.address, gnosisSafe.address],
        [0, 0],
        ["", ""],
        [approveHashCalldata, execTransactionCalldata],
        "mock contract proposal"
    );

    await tx.wait();
    const events = await gov.queryFilter("ProposalCreated");
    const proposalId = events[events.length - 1].args.id;
    console.log("account 0 created proposal id: ", proposalId.toString());
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    const networkId = (await ethers.provider.getNetwork()).chainId;
    if (networkId == 1337) {
        await advanceBlock();
    }
    const govWithSigner1 = gov.connect(accounts[1]);
    tx = await govWithSigner1.castVote(proposalId, true, { gasLimit: 150000 });
    await tx.wait();
    console.log("account 1 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    //delegated vote
    const govWithSigner4 = gov.connect(accounts[4]);
    tx = await govWithSigner4.castVote(proposalId, true, { gasLimit: 150000 });
    await tx.wait();
    console.log("account 4 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        for (let index = 0; index < 11; index++) {
            await advanceBlock();
        }
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
        await waitSeconds(11 * block)
    }


    tx = await govWithSigner0.queue(proposalId, { gasLimit: 200000 } );
    await tx.wait();
    console.log("proposal queued");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        await advanceTimeAndBlock(3 * days);
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
        await waitSeconds(block)
    }

    tx = await govWithSigner0.execute(proposalId, { gasLimit: 500000 });
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