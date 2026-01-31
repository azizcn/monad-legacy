import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract source
const contractSource = fs.readFileSync(
    path.join(__dirname, "../contracts/Testament.sol"),
    "utf8"
);

// Compile using solc
import solc from "solc";

const input = {
    language: "Solidity",
    sources: {
        "Testament.sol": {
            content: contractSource,
        },
        "@openzeppelin/contracts/utils/ReentrancyGuard.sol": {
            content: fs.readFileSync(
                path.join(__dirname, "../node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol"),
                "utf8"
            ),
        },
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
        outputSelection: {
            "*": {
                "*": ["abi", "evm.bytecode"],
            },
        },
    },
};

console.log("Compiling contract...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach((err) => {
        console.log(err.formattedMessage);
    });
}

const contract = output.contracts["Testament.sol"]["Testament"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// Deploy
async function deploy() {
    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deploying from:", wallet.address);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const testament = await factory.deploy();

    await testament.waitForDeployment();
    const address = await testament.getAddress();

    console.log("✅ Testament deployed to:", address);

    // Save deployment info
    const deploymentInfo = {
        address,
        network: "monadTestnet",
        chainId: 10143,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentsDir, "monadTestnet.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    fs.writeFileSync(
        path.join(deploymentsDir, "Testament.json"),
        JSON.stringify({ abi }, null, 2)
    );

    console.log("\n📝 Deployment saved to deployments/");
    console.log(`\n🔍 Update frontend/lib/contract.ts with: ${address}`);
}

deploy().catch(console.error);
