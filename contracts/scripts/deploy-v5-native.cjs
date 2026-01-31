const hre = require("hardhat");

async function main() {
    console.log("Starting deployment for Testament V5 (Native MON)...");

    const Testament = await hre.ethers.getContractFactory("Testament");
    console.log("Deploying contract...");

    // No constructor arguments needed for V5
    const testament = await Testament.deploy();

    console.log("Waiting for deployment...");
    await testament.waitForDeployment();

    const testamentAddress = await testament.getAddress();

    console.log("----------------------------------------------------");
    console.log("Testament V5 deployed successfully!");
    console.log("Contract Address:", testamentAddress);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
