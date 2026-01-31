const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying Testament V6 (Auto-Escrow)...");

    // Protocol wallet (gas fee için komisyon alınacak)
    const [deployer] = await hre.ethers.getSigners();
    const protocolWallet = deployer.address;

    console.log("📝 Deploying with wallet:", deployer.address);
    console.log("💰 Protocol wallet:", protocolWallet);

    const Testament = await hre.ethers.getContractFactory("Testament");
    const testament = await Testament.deploy(protocolWallet);

    await testament.waitForDeployment();
    const address = await testament.getAddress();

    console.log("✅ Testament V6 deployed to:", address);

    // Save to file
    fs.writeFileSync("address-v6.txt", address);
    console.log("📄 Address saved to address-v6.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
