const hre = require("hardhat");

async function main() {
    const Testament = await hre.ethers.getContractFactory("Testament");
    const testament = await Testament.deploy();
    await testament.waitForDeployment();
    const address = await testament.getAddress();
    console.log(address);
    // Write to file using fs
    const fs = require('fs');
    fs.writeFileSync('address.txt', address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
