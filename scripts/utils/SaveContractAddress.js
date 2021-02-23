module.exports = async function saveContractAddress(name, contract) {
    const fs = require("fs");

    contractAddressesFile = "./ContractAddresses.json";

    if (!fs.existsSync(contractAddressesFile)) {
        fs.writeFileSync(
            "./ContractAddresses.json",
            JSON.stringify({ [name]: contract.address }, undefined, 2)
        );
    } else {
        const addresses = JSON.parse(fs.readFileSync(contractAddressesFile));
        addresses[name] = contract.address;
        fs.writeFileSync(
            "./ContractAddresses.json",
            JSON.stringify(addresses, undefined, 2)
        );
    }
}