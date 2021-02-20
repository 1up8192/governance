module.exports = async function getProposalState(gov, proposalId) {
    const state = await gov.state(proposalId);
    let stateString;
    switch (state.toString()) {
        case "0":
            stateString = "Pending";
            break;
        case "1":
            stateString = "Active";
            break;
        case "2":
            stateString = "Canceled";
            break;
        case "3":
            stateString = "Defeated";
            break;
        case "4":
            stateString = "Succeeded";
            break;
        case "5":
            stateString = "Queued";
            break;
        case "6":
            stateString = "Expired";
            break;
        case "7":
            stateString = "Executed";
            break;
        default:
            stateString = "Unknown";
            break;
    }
    return stateString;
}