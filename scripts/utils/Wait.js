module.exports = async function waitSeconds(seconds) {
    await new Promise(r => setTimeout(r, seconds * 1000));
}