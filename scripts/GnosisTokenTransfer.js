
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

    let index = 0;
    for await (let balance of addresses.slice(0, 5).map(async address => usf.balanceOf(address))) {
        console.log(`account ${index} balance: ${balance}`)
        index++;
    }

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

    const transactionMessage = await gnosisSafe.encodeTransactionData(
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

    const externalAccountSignature = await accounts[0].signMessage(ethers.utils.arrayify(transactionHash));
    console.log("externalAccountSignature: ", externalAccountSignature);
    const signature = externalAccountSignature + "000000000000000000000000" + addresses[0].replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01";

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

    const events = await gnosisSafe.queryFilter("CurrentOwner");
    const currentOwner = events[events.length - 1].args.currentOwner;

    console.log("currentOwner: ", currentOwner)


    console.log(`account 5 token balance after: ${(await usf.balanceOf(addresses[5]))}`)
    console.log(`gnosisSafe token balance after: ${(await usf.balanceOf(contractAddresses.GnosisSafe))}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });