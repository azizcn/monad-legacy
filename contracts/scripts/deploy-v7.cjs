const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying Testament V7...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying from:", deployer.address);

    const protocolWallet = deployer.address;
    console.log("💰 Protocol wallet:", protocolWallet);

    const Testament = await hre.ethers.getContractFactory("Testament");
    const testament = await Testament.deploy(protocolWallet);

    await testament.waitForDeployment();
    const address = await testament.getAddress();

    console.log("✅ Testament V7 deployed to:", address);

    fs.writeFileSync("address-v7.txt", address);
    console.log("📄 Address saved to address-v7.txt");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
