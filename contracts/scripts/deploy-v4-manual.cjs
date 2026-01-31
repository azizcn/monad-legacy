const hre = require("hardhat");

async function main() {
    console.log("Starting deployment for Testament V4...");

    // Token address from previous deployments
    const tokenAddress = "0xAb17134dB14E29c961eB2E4b8A44CC6E26abBf74";
    console.log("Using Token Address:", tokenAddress);

    const Testament = await hre.ethers.getContractFactory("Testament");
    console.log("Deploying contract...");

    // Deploy contract
    const testament = await Testament.deploy(tokenAddress);

    console.log("Waiting for deployment...");
    await testament.waitForDeployment();

    const testamentAddress = await testament.getAddress();

    console.log("----------------------------------------------------");
    console.log("Testament V4 deployed successfully!");
    console.log("Contract Address:", testamentAddress);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
