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

    
    console.log("=== CONTRACT DEPLOYMENTS ===")
    const { deploy } = require("./scripts/Deploy");
    await deploy({
      tokenRecipient: taskArgs.token,
      timeLockAdmin: taskArgs.timelock,
      guardian: taskArgs.guardian
    });
    console.log("=== DEPLOY SAFE ===")
    const { deploySafe } = require("./scripts/DeploySafe");
    await deploySafe();
    console.log("=== TIMELOCK ADMIN SETUP ===")
    const { setTimelockAdmin } = require("./scripts/SetTimelockAdmin");
    await setTimelockAdmin();
    console.log("=== TOKEN DISTRIBUTION ===")
    const { distributeTokens } = require("./scripts/DistributeTokens");
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
        gasPrice: 10000000000, // 10 gwei
      }
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${Secrets.infuraProjectId}`,
      accounts: {
        mnemonic: Secrets.mnemonic,
        initialIndex: 0,
        count: 10,
        gasPrice: 5000000000, // 5 gwei
      }
    }
  },
  solidity: {
    compilers: [ 
      { version: "0.5.16" },
      //{ version: "0.6.6" }
    ],
   },
};

