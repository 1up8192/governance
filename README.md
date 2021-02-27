## governance mainnet deployment process

2 main tasks: deploy-mainnet and execute-set-timelock-admin

### deploy-mainnet task

optional parameter --index: account index of the mnemonic to be used for the deplyoer account, default is 0


4 scripts in task:
#### DeployMainnet: governance system contract deplyoments
- deploys token with the deplyoer address set as the token recipient
- deploys timelock with the deplyoer address set as admin, delay has to be set higher than MINIMUM_DELAY (for testing the minimum is set to 0, change before mainnet deployment!)
- deploys GovernorAlpha with the timelock and token addresses in parameter and the deplyoer address set as guardian
- all contract addresses get saved into ContractAddresses.json, this is used later for the other scripts
#### QueueSetTimelockAdminMainnet: first half of script to setup the GovernorAlpha contract as the Timelock admin (this is necessary for proposals)
- queues the transaction that will allow to set the GovernorAlpha contract as the Timelock admin
- it prints the eta parameter, which will be needed for execute-set-timelock-admin
- delay is also printed, execute-set-timelock-admin can be used after its up
#### DeploySafeMainnet: deplyos gnosis safe multisig
- deploys gnosis safe MasterCopy 
- deploys ProxyFactory contracts
- creates a gnosis safe proxy and sets it up one of the signers (owners) is the GovernorAlpha 
- QUESTION: _threshold number value? also there should be external value owners probably, how many, what accounts?

Safe deplyoment can excluded from the process by simply disabling the script and done separately later
#### DistributeTokensMainnet: 
- sends tokens to some accounts from deployer address
- QUESTION: do want to distribute some tokens to external accounts beside the safe to be able to vote, or have external accounts executing transfers from the safe without the governance?
- QUESTION: if we want to distribute tokens to external accounts: what accounts, how many tokens?
- then transfers all the rest to GnosisSafe

### execute-set-timelock-admin task 

1 script in task:
#### ExecuteSetTimelockAdminMainnet: to execute the queued Timlock admin setup transaction after the set delay is up
- Eta parameter has to be supplied with --eta to be able to find the same tx that was queued
- has to be executed delay time later

### How to:

step 0: checkout the mainnet branch

steps on ganache
- start ganache
- have .env setup with your mnemonic
- `npx hardhat deploy-mainnet`
- wait for delay (default 60 seconds)
- `npx hardhat execute-set-timelock-admin --eta <eta timestamp from deploy output>`

steps on ropsten/goerli
- have .env setup with your mnemonic and infura id
- `npx hardhat deploy-mainnet --network <ropsten/goerli>`
- wait for delay (default 60 seconds)
- `npx hardhat execute-set-timelock-admin --eta <eta timestamp from deploy output> --network <ropsten/goerli>`

steps on mainnet
- have all parameters correctly set up  delay, safe owner, safe signer, token receivers, all contract parameters in here: https://docs.google.com/spreadsheets/d/1vNLjU2kZ643kDfYi3Db1PVpxVWzt_wAHxd2kc9N_qes/edit#gid=0
- have .env setup with your mnemonic and infura id
- set up correct mainnet gasPrice in hardhat.config.js
- `npx hardhat deploy-mainnet --network mainnet`
- wait for delay (was originally 2 days)
- `npx hardhat execute-set-timelock-admin --eta <eta timestamp from deploy output> --network mainnet`
