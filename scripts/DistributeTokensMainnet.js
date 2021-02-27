
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
  
  deployersAmount = 123; /*TODO calculate deployer compensation */

  liquidityMinersAddress = "0x0000000000000000000000000000000000000001"; //TODO real address  
  liquidityMinersAmount = ethers.utils.parseEther("2700000"); //2.7 M

  gnosisSafeAmount = ethers.utils.parseEther("40300000"); //40.3 M = 43 M - 2.7 M

  teamAndInvestorsAddress = "0x0000000000000000000000000000000000000002"; //TODO real address  
  
  let tx;
  tx = await usfWithSigner0.transfer(liquidityMinersAddress, liquidityMinersAmount, { gasLimit: 150000 });
  await tx.wait();

  tx = await usfWithSigner0.transfer(contractAddresses.GnosisSafe, gnosisSafeAmount, { gasLimit: 150000 });
  await tx.wait();
  
  const deployersRemainingBalace = await usf.balanceOf(addresses[accountIndex]);

  teamAndInvestorsAmount = deployersRemainingBalace.sub(deployersAmount); //rest except deplyoers amount
  tx = await usfWithSigner0.transfer(teamAndInvestorsAddress, teamAndInvestorsAmount, { gasLimit: 150000 });
  await tx.wait();
  
  console.log(`liquidity miner's address: ${liquidityMinersAddress}`)
  console.log(`liquidity miner's address: ${await usf.balanceOf(liquidityMinersAddress)}`)

  console.log(`gnosis safe address: ${contractAddresses.GnosisSafe}`)
  console.log(`gnosis safe balance: ${await usf.balanceOf(contractAddresses.GnosisSafe)}`)

  console.log(`deplyoer's address: ${addresses[accountIndex]}`)
  console.log(`deplyoer's balance: ${await usf.balanceOf(addresses[accountIndex])}`)
  
  console.log(`team and investor's address: ${teamAndInvestorsAddress}`)
  console.log(`team and investor's balance: ${await usf.balanceOf(teamAndInvestorsAddress)}`)


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