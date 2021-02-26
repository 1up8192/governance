
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddresses = require("../ContractAddresses.json");
const BigNumber = ethers.BigNumber;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');

async function main(accountIndex) {

  if (accountIndex == null) {
    accountIndex = 0;
  }

  const accounts = await ethers.getSigners();
  const addresses = accounts.map(account => account.address);

  const usf = await ethers.getContractAt("USF", contractAddresses.USF);
  const usfWithSigner0 = usf.connect(accounts[accountIndex]);
  let tx;

  //some tranfers are needed to external accounts to have external account voters in the governance system

  tx = await usfWithSigner0.transfer(addresses[1], ethers.utils.parseEther("350000"), { gasLimit: 150000 });
  await tx.wait();

  tx = await usfWithSigner0.transfer(addresses[2], ethers.utils.parseEther("50000"), { gasLimit: 150000 });
  await tx.wait();

  tx = await usfWithSigner0.transfer(addresses[3], ethers.utils.parseEther("200000"), { gasLimit: 150000 });
  await tx.wait();

  const ownerBalace = await usf.balanceOf(addresses[accountIndex]);
  tx = await usfWithSigner0.transfer(contractAddresses.GnosisSafe, ownerBalace, { gasLimit: 150000 });
  await tx.wait();
  
  console.log(`gnosis safe balance: ${await usf.balanceOf(contractAddresses.GnosisSafe)}`)
  console.log(`gnosis address: ${contractAddresses.GnosisSafe}`)
  let index = 0;
  for await (let balance of addresses.map(async address => usf.balanceOf(address))) {
    console.log(`account ${index} balance: ${balance}`)
    index++;
  }

}

/* main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); */

module.exports = {
  distributeTokens: main
}