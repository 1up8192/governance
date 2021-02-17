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
  .addOptionalParam("token", "The address to receive the initial supply")
  .addOptionalParam("timelock", "The timelock administrator")
  .addOptionalParam("guardian", "The governor guardian").setAction(async taskArgs => {

    const { deploy } = require("./scripts/Deploy");

    const accounts = await ethers.getSigners();

    let tokenRecipient = taskArgs.token;
    let timeLockAdmin = taskArgs.timelock;
    let guardian = taskArgs.guardian;

    if (tokenRecipient == null) {
      tokenRecipient = accounts[0].address;
    }
    if (timeLockAdmin == null) {
      timeLockAdmin = accounts[0].address;
    }
    if (guardian == null) {
      guardian = accounts[0].address;
    }

    console.log("token recipient: ", tokenRecipient)

    await deploy({
      tokenRecipient: tokenRecipient,
      timeLockAdmin: timeLockAdmin,
      guardian: guardian
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

