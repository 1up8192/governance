require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-web3");
require('dotenv').config();

const Secrets = {
  mnemonic: process.env.MNEMONIC,
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  mainnetMnemonic: undefined,
};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("accountsWeb3", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

task("deploy", "Deploys a COMPound style governance system")
  .addOptionalParam("token", "The address to receive the initial supply")
  .addOptionalParam("timelock", "The timelock administrator")
  .addOptionalParam("guardian", "The governor guardian").setAction(async taskArgs => {

    const { deploy } = require("./scripts/Deploy");
    const { setTimelockAdmin } = require("./scripts/SetTimelockAdmin");
    const { distributeTokens } = require("./scripts/DistributeTokens");

    console.log("=== CONTRACT DEPLOYMENTS ===")
    await deploy({
      tokenRecipient: taskArgs.token,
      timeLockAdmin: taskArgs.timelock,
      guardian: taskArgs.guardian
    });
    console.log("=== TIMELOCK ADMIN SETUP ===")
    await setTimelockAdmin();
    console.log("=== TOKEN DISTRIBUTION ===")
    await distributeTokens();

  })

task("distributeTokens", "", async () => {
    const { distributeTokens } = require("./scripts/DistributeTokens");
    await distributeTokens();
  })


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "ganache",
  networks: {

    hardhat: {
    },
    ganache: {
      url: "http://127.0.0.1:9545",
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${Secrets.infuraProjectId}`,
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
      }
    }
  },
  solidity: "0.5.16",
};

