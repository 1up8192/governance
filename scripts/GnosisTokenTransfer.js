
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddresses = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');
const zeroAddress = "0x0000000000000000000000000000000000000000"



async function main() {
    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const usf = await ethers.getContractAt("USF", contractAddresses.USF);

    console.log(`account 5 token balance before: ${(await usf.balanceOf(addresses[5]))}`)
    console.log(`gnosisSafe token balance before: ${(await usf.balanceOf(contractAddresses.GnosisSafe))}`)

    const toSend = "50000";
    console.log(`sending ${toSend}`);

    const transferCalldata = usf.interface.encodeFunctionData("transfer", [addresses[5], ethers.utils.parseEther(toSend)]);

    const gnosisSafe = await ethers.getContractAt("GnosisSafe", contractAddresses.GnosisSafe);
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

    console.log("transactionHash: ", transactionHash);

    const externalAccountSignature = await accounts[1].signMessage(ethers.BigNumber.from(transactionHash));

    const externalAccountSignatureArr = ethers.utils.arrayify(externalAccountSignature);
    externalAccountSignatureArr[64] += 4;
    const externalAccountSignatureVPlus4 = ethers.utils.hexlify(externalAccountSignatureArr);

    console.log("externalAccountSignature: ", externalAccountSignature);
    console.log("externalAccountSignatureVPlus4: ", externalAccountSignatureVPlus4);
    const signature = "0x000000000000000000000000" + addresses[0].replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01" +
        externalAccountSignatureVPlus4.replace('0x', '');
    console.log("signatures: ", signature);


    const gnosisSafeWithSigner0 = gnosisSafe.connect(accounts[0]);

    let tx;
    tx = await gnosisSafeWithSigner0.approveHash(transactionHash);
    tx.wait();
    tx = await gnosisSafeWithSigner0.execTransaction(
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
    );
    tx.wait();

    /* const networkId = (await ethers.provider.getNetwork()).chainId;
    const events = await gnosisSafe.queryFilter("CurrentOwner");
    if (networkId != 1337) {
        await waitSeconds(10);
    }

    const currentOwner1 = events[events.length - 1].args.currentOwner;
    const lastOwner1 = events[events.length - 1].args.lastOwner;
    const currentOwner2 = events[events.length - 1].args.currentOwner;
    const lastOwner2 = events[events.length - 1].args.lastOwner;


    console.log("currentOwner1: ", currentOwner1)
    console.log("lastOwner1: ", lastOwner1)
    console.log("currentOwner2: ", currentOwner2)
    console.log("lastOwner2: ", lastOwner2)
    */

    console.log(`account 5 token balance after: ${(await usf.balanceOf(addresses[5]))}`)
    console.log(`gnosisSafe token balance after: ${(await usf.balanceOf(contractAddresses.GnosisSafe))}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });