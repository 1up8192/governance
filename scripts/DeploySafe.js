const hre = require("hardhat");
const ethers = hre.ethers;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

async function main() {

    // Compile our Contracts, just in case
    await hre.run('compile');

    const accounts = await ethers.getSigners();

    // Deploy GnosisSafe
    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");
    const masterCopy = await GnosisSafe.deploy();
    await masterCopy.deployed();

    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    const proxyFactory = await GnosisSafeProxyFactory.deploy();
    await proxyFactory.deployed();

    const proxyFactorySigner0 = proxyFactory.connect(accounts[0]);

    const safe = await proxyFactorySigner0.createProxy(masterCopy.address, 0x0);


    /* await gnosisSafe.setup(
        [accounts[0].address, accounts[1].address, accounts[2].address], // _owners List of Safe owners
        2, // _threshold Number of required confirmations for a Safe transaction.
        ZERO_ADDRESS, // to Contract address for optional delegate call
        "0x", // data Data payload for optional delegate call
        ZERO_ADDRESS, // fallbackHandler Handler for fallback calls to this contract
        ZERO_ADDRESS, // paymentToken Token that should be used for the payment (0 is ETH)
        0, // payment Value that should be paid
        ZERO_ADDRESS // paymentReceiver Adddress that should receive the payment (or 0 if tx.origin)
    );
    //saveAddress("GnosisSafe", gnosisSafe) */

    console.log(`GnosisSafe deployed to: ${safe.address}`)

    //const initialBalance = await token.balanceOf(tokenRecipient);
    //console.log(`${initialBalance / 1e18} tokens transfered to ${tokenRecipient}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });