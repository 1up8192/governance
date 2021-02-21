compile:

`npx hardhat compile`

test deploy with hardhat network:

`npx hardhat deploy --network hardhat`

test deploy with ganache (set up .env and use ganache with the same mnemonic):

`npx hardhat deploy --network ganache`

or

`npx hardhat deploy` (ganache is the default network)


deploy to ropsten (not tested yet), if parameters are omitted it will use the 0 index address of the mnemonic:
