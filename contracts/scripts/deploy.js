import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Deploying Testament contract to Monad Testnet...");

    // Get the contract factory
    const Testament = await hre.ethers.getContractFactory("Testament");

    // Deploy the contract
    console.log("Deployment in progress...");
    const testament = await Testament.deploy();

    await testament.waitForDeployment();

    const address = await testament.getAddress();
    console.log(`✅ Testament deployed to: ${address}`);

    // Save deployment info
    const deploymentInfo = {
        address: address,
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployer: (await hre.ethers.getSigners())[0].address,
        timestamp: new Date().toISOString(),
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment address
    fs.writeFileSync(
        path.join(deploymentsDir, `${hre.network.name}.json`),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Save ABI
    const artifact = await hre.artifacts.readArtifact("Testament");
    fs.writeFileSync(
        path.join(deploymentsDir, "Testament.json"),
        JSON.stringify({ abi: artifact.abi }, null, 2)
    );

    console.log("\n📝 Deployment info saved to deployments/");
    console.log("\n🔍 Next steps:");
    console.log(`1. Update frontend/lib/contract.ts with address: ${address}`);
    console.log(`2. Verify contract on explorer:`);
    console.log(`   npx hardhat verify --network monadTestnet ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
