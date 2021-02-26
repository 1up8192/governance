
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
<<<<<<< HEAD
const contractAddress = require("../ContractAddresses.json");
=======
const contractAddresses = require("../ContractAddresses.json");
>>>>>>> gnosis-2signers-proposal
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

<<<<<<< HEAD
    const usf = await ethers.getContractAt("USF", contractAddress.USF);

    const transferCalldata = usf.interface.encodeFunctionData("transfer", [addresses[5], ethers.utils.parseEther("50000")]);

    console.log("transferCalldata:", transferCalldata);

    
    const gnosisSafe = await ethers.getContractAt("GnosisSafe", contractAddress.GnosisSafe);
=======
    const usf = await ethers.getContractAt("USF", contractAddresses.USF);

    console.log(`account 5 token balance before: ${(await usf.balanceOf(addresses[5]))}`);
    console.log(`gnosisSafe token balance before: ${(await usf.balanceOf(contractAddresses.GnosisSafe))}`);

    const toSend = "50000";
    console.log(`sending ${toSend}`);

    const transferCalldata = usf.interface.encodeFunctionData("transfer", [addresses[5], ethers.utils.parseEther(toSend)]);

    console.log("transferCalldata:", transferCalldata);


    const gnosisSafe = await ethers.getContractAt("GnosisSafe", contractAddresses.GnosisSafe);
>>>>>>> gnosis-2signers-proposal
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

<<<<<<< HEAD
=======
    console.log("transactionHash: ", transactionHash);

    const externalAccountSignature = await accounts[0].signMessage(ethers.BigNumber.from(transactionHash));

    const externalAccountSignatureArr = ethers.utils.arrayify(externalAccountSignature);
    externalAccountSignatureArr[64] += 4;
    const externalAccountSignatureVPlus4 = ethers.utils.hexlify(externalAccountSignatureArr);

    const addressesAndSignatures = {};
    addressesAndSignatures[contractAddresses.Timelock] = "000000000000000000000000" + contractAddresses.Timelock.replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01";
    addressesAndSignatures[addresses[0]] = externalAccountSignatureVPlus4.replace('0x', '');
    console.log("externalAccountSignature, v + 4: ", externalAccountSignatureVPlus4);
    let signatures = "0x";
    //signatures has to be ordered by accounts
    for (const address of Object.keys(addressesAndSignatures).sort()) {
        signatures += addressesAndSignatures[address];
    }
    console.log("signatures: ", signatures);

>>>>>>> gnosis-2signers-proposal
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
        signatures
    ]);

    await makeAndExecuteProposal(accounts, approveHashCalldata);
    await makeAndExecuteProposal(accounts, execTransactionCalldata);


    /*     const usfWithSigner5 = usf.connect(accounts[5]);
        tx = await usfWithSigner5.transferFrom(contractAddresses.GnosisSafe, addresses[5], toSend);
        tx.wait(); */


    console.log(`account 5 token balance after: ${(await usf.balanceOf(addresses[5]))}`)
    console.log(`gnosisSafe token balance after: ${(await usf.balanceOf(contractAddresses.GnosisSafe))}`)

}

async function makeAndExecuteProposal(accounts, calldata) {
    const gov = await ethers.getContractAt("GovernorAlpha", contractAddresses.GovernorAlpha);
    const govWithSigner0 = gov.connect(accounts[0]);
    let tx;

    tx = await govWithSigner0.propose(
        [contractAddresses.GnosisSafe],
        [0],
        [""],
        [calldata],
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
<<<<<<< HEAD
    console.log("account 2 voted yes");
=======
    console.log("account 4 voted yes");
>>>>>>> gnosis-2signers-proposal
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        for (let index = 0; index < 11; index++) {
            await advanceBlock();
        }
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
<<<<<<< HEAD
        await waitSeconds(11 * block)
    }


    tx = await govWithSigner0.queue(proposalId, { gasLimit: 150000 });
=======
        await waitSeconds(11 * block);
    }


    tx = await govWithSigner0.queue(proposalId, { gasLimit: 200000 });
>>>>>>> gnosis-2signers-proposal
    await tx.wait();
    console.log("proposal queued");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    if (networkId == 1337) {
        await advanceTimeAndBlock(3 * days);
    } else if (networkId == 3 || networkId == 5) {
        const block = 15;
<<<<<<< HEAD
        await waitSeconds(block)
=======
        await waitSeconds(block);
>>>>>>> gnosis-2signers-proposal
    }

    tx = await govWithSigner0.execute(proposalId, { gasLimit: 500000 });
    await tx.wait();
    console.log("proposal executed");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);
<<<<<<< HEAD

    const xValue2 = await governable.getX();

    console.log(`governable value after proposal executed: ${xValue2.toString()}`);
=======
>>>>>>> gnosis-2signers-proposal
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });