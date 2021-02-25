
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');
const waitSeconds = require('./utils/Wait');
const zeroAddress = "0x0000000000000000000000000000000000000000"



async function main() {
    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const usf = await ethers.getContractAt("USF", contractAddress.USF);

    console.log(`account 5 token balance before: ${(await usf.balanceOf(addresses[5]))}`)
    const toSend = 50000;
    console.log(`sending ${toSend}`);

    const transferCalldata = usf.interface.encodeFunctionData("transfer", [addresses[5], ethers.utils.parseEther(toSend.toString())]);

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

    gnosisSafeWithSigner0 = gnosisSafe.connect(accounts[0]);

    let tx;
    tx = await gnosisSafeWithSigner0.approveHash(transactionHash);
    tx.wait();
    const signature = "0x000000000000000000000000" + addresses[0].replace('0x', '') + "0000000000000000000000000000000000000000000000000000000000000000" + "01"
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

    const ExecutionSuccessLogs = await gnosisSafe.queryFilter("ExecutionSuccess");
    const ExecutionFailureLogs = await gnosisSafe.queryFilter("ExecutionFailure");
    
    console.log(`account 5 token balance after: ${(await usf.balanceOf(addresses[5]))}`)
    console.log(`ExecutionSuccessLog: `)
    console.log(ExecutionSuccessLogs[ExecutionSuccessLogs.length - 1])
    console.log(`ExecutionFailureLog: `)
    console.log(ExecutionFailureLogs[ExecutionFailureLogs.length - 1])
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });