
const hre = require("hardhat");
const ethers = hre.ethers;
const web3 = hre.web3;
const contractAddress = require("../ContractAddresses.json");
const { days, advanceTime, advanceBlock, advanceTimeAndBlock } = require('./utils/TimeTravel');
const getProposalState = require('./utils/GetProposalState');

function encode(types, values) {
    return ethers.utils.defaultAbiCoder.encode(types, values);
}

function keccak(types, values) {
    return ethers.utils.solidityKeccak256(types, values);
}

// data for vote signing
const tokenName = "UnslashedFinanceToken";
let chainId;
const DOMAIN_TYPEHASH = keccak(["string"], ["EIP712Domain(string name,uint256 chainId,address verifyingContract)"])
const BALLOT_TYPEHASH = keccak(["string"], ["Ballot(uint256 proposalId,bool support)"])

/* reverse of this solidity code in castVoteBySig
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 public constant BALLOT_TYPEHASH = keccak256("Ballot(uint256 proposalId,bool support)");
    bytes32 domainSeparator = keccak256(abi.encode(DOMAIN_TYPEHASH, keccak256(bytes(name)), getChainId(), address(this)));
    bytes32 structHash = keccak256(abi.encode(BALLOT_TYPEHASH, proposalId, support));
    bytes32 message = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
*/
function encodeVoteMessage(governanceAddress, proposalId, support) {
    const tokenNameHash = keccak(["string"], [tokenName]);
    let packedData = encode(["bytes32", "bytes32", "uint32", "address"], [DOMAIN_TYPEHASH, tokenNameHash, chainId, governanceAddress]);
    const domainSeparator = keccak(["bytes"], [packedData]);
    packedData = encode(["bytes32", "uint256", "bool"], [BALLOT_TYPEHASH, proposalId, support]);
    const structHash = keccak(["bytes"], [packedData]);
    const prefix = 0x1901;
    packedData = encode(["bytes32", "bytes32"], [domainSeparator, structHash]);
    const message = keccak(["bytes", "bytes"], [prefix, packedData]); // need prefix separately as the encode breaks it
    return message;
}

async function main() {
    const accounts = await ethers.getSigners();
    const addresses = accounts.map(account => account.address);

    const ownerAccount = accounts[0];
    const owner = addresses[0];
    const alice = addresses[1];
    const bob = addresses[2];
    const cecile = addresses[3];

    chainId = await web3.eth.getChainId();

    const governable = await ethers.getContractAt("Governable", contractAddress.Governable);
    const xValue = await governable.getX();

    const calldata = governable.interface.encodeFunctionData("setX", [xValue.add(1)]);

    console.log(`governable value before proposal executed: ${xValue.toString()}, expected value to be set: ${xValue.add(1).toString()}`);
    console.log("calldata:", calldata);

    const gov = await ethers.getContractAt("GovernorAlpha", contractAddress.GovernorAlpha);
    const govWithSigner0 = gov.connect(accounts[0]);
    let tx;
    tx = await govWithSigner0.propose(
        [governable.address],
        [0],
        [""],
        [calldata],
        "mock contract proposal"
    );

    await tx.wait();
    const events = await gov.queryFilter("ProposalCreated");
    const proposalId = events[events.length - 1].args.id;
    console.log("account 0 created proposal id: ", proposalId.toString());
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    await advanceBlock();

    const govWithSigner1 = gov.connect(accounts[1]);
    tx = await govWithSigner1.castVote(proposalId, true);
    await tx.wait();
    console.log("account 1 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    // vote by signed message
    const message = encodeVoteMessage(gov.address, proposalId, true);
    console.log("message " + message);
    const messageArray = ethers.utils.arrayify(message);
    const rawSignature = await accounts[2].signMessage(messageArray);
    const signature = ethers.utils.splitSignature(rawSignature);
    const govWithSigner2 = gov.connect(accounts[2]);
    tx = await govWithSigner2.castVoteBySig(proposalId, true, signature.v, signature.r, signature.s);
    await tx.wait();
    console.log("account 2 voted yes by signature");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    //delegated vote
    const govWithSigner4 = gov.connect(accounts[4]);
    tx = await govWithSigner4.castVote(proposalId, true);
    await tx.wait();
    console.log("account 2 voted yes");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    for (let index = 0; index < 6; index++) {
        await advanceBlock();
    }

    tx = await govWithSigner0.queue(proposalId);
    await tx.wait();
    console.log("proposal queued");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    advanceTimeAndBlock(3 * days);

    tx = await govWithSigner0.execute(proposalId, { gasLimit: 500000 });
    await tx.wait();
    console.log("proposal executed");
    console.log(`proposal state: ${await getProposalState(gov, proposalId)}`);

    const xValue2 = await governable.getX();

    console.log(`governable value after proposal executed: ${xValue2.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });