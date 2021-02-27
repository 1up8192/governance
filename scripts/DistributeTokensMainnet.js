
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const BigNumber = ethers.BigNumber;
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
//const contractAddresses = require("../ContractAddresses.json"); for some reason if I use require here, the gnosis address is not there yet...
const fs = require("fs");
const contractAddresses = JSON.parse(fs.readFileSync("./ContractAddresses.json"));


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

  tx = await usfWithSigner0.transfer(addresses[1], ethers.utils.parseEther("2100000"), { gasLimit: 150000 }); //set aside for the liquidity miners
  await tx.wait();

  const ownerBalace = await usf.balanceOf(addresses[accountIndex]);
  tx = await usfWithSigner0.transfer(contractAddresses.GnosisSafe, ownerBalace.sub(123/*TODO calculate deployer compensation */), { gasLimit: 150000 });
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