const hre = require("hardhat");
const ethers = hre.ethers;
const saveAddress = require('./utils/SaveContractAddress');
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

async function main() {

    const accounts = await ethers.getSigners();

    // Deploy GnosisSafe
    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const masterCopy = await GnosisSafe.deploy();
    await masterCopy.deployed();

    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    const proxyFactory = await GnosisSafeProxyFactory.deploy();
    await proxyFactory.deployed();

    const proxyFactoryWithSigner0 = proxyFactory.connect(accounts[0]);

    let tx = await proxyFactoryWithSigner0.createProxy(masterCopy.address, 0, { gasLimit: 200000 });
    await tx.wait();
    const events = await proxyFactory.queryFilter("ProxyCreation");
    const safeProxy = events[events.length - 1].args.proxy;

    saveAddress("GnosisSafeMasterCopy", masterCopy.address);
    saveAddress("GnosisSafe", safeProxy);

    const safe = await ethers.getContractAt("GnosisSafe", safeProxy);

    const safeWithSigner0 = safe.connect(accounts[0]);

    const contractAddresses = require("../ContractAddresses.json");

    await safeWithSigner0.setup(
        [contractAddresses.Timelock], // _owners List of Safe owners
        1, // _threshold Number of required confirmations for a Safe transaction.
        ZERO_ADDRESS, // to Contract address for optional delegate call
        0, // data Data payload for optional delegate call
        ZERO_ADDRESS, // fallbackHandler Handler for fallback calls to this contract
        ZERO_ADDRESS, // paymentToken Token that should be used for the payment (0 is ETH)
        0, // payment Value that should be paid
        ZERO_ADDRESS // paymentReceiver Adddress that should receive the payment (or 0 if tx.origin)
    ); 

    console.log(`GnosisSafe deployed to: ${safe.address}`)

    //const initialBalance = await token.balanceOf(tokenRecipient);
    //console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient}`);
}

/* main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    }); */

module.exports = {
    deploySafe: main
}