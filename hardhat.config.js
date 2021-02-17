require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
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

task("Deploy", "Deploys a COMPound style governance system")
.addParam("token", "The address to receive the initial supply")
.addParam("timelock", "The timelock administrator")
.addParam("guardian", "The governor guardian").setAction(async taskArgs => {
    
  const { deploy } = require("./scripts/Deploy");

    await deploy({
      tokenRecipient: taskArgs.token,
      timeLockAdmin: taskArgs.timelock,
      guardian: taskArgs.guardian
    });

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

