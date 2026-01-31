const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting deployment with Hardhat...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy LegacyToken
    console.log("Deploying LegacyToken...");
    const LegacyToken = await hre.ethers.getContractFactory("LegacyToken");
    const token = await LegacyToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ LegacyToken Deployed at: ${tokenAddress}`);

    // 2. Deploy Testament
    console.log("Deploying Testament...");
    const Testament = await hre.ethers.getContractFactory("Testament");
    const testament = await Testament.deploy(tokenAddress); // Pass token address
    await testament.waitForDeployment();
    const testamentAddress = await testament.getAddress();
    console.log(`✅ Testament Deployed at: ${testamentAddress}`);

    // 3. Save Deployment Info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployer: deployer.address,
        tokenAddress: tokenAddress,
        testamentAddress: testamentAddress,
        timestamp: new Date().toISOString()
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filePath = path.join(deploymentsDir, `${hre.network.name}-v3.json`);
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to ${filePath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
