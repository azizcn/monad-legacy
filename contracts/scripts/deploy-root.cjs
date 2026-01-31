const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

async function main() {
    // Run from root: c:\Users\azizc\OneDrive\Belgeler\projeler\monadlegacy
    console.log("Starting deployment from root...");

    // 1. Setup Provider and Wallet
    const envPath = path.join(process.cwd(), 'contracts', '.env');
    require('dotenv').config({ path: envPath });

    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error(`Private key not found in ${envPath}`);

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    try {
        console.log(`Deploying from account: ${wallet.address}`);
        const balance = await provider.getBalance(wallet.address);
        console.log(`Account balance: ${ethers.formatEther(balance)} MON`);
    } catch (e) {
        console.log("Could not fetch balance/info:", e.message);
    }

    // 2. Compile Contracts
    function compile(contractName, fileName) {
        const filePath = path.join(process.cwd(), 'contracts', 'contracts', fileName);
        const content = fs.readFileSync(filePath, 'utf8');

        const input = {
            language: 'Solidity',
            sources: { [fileName]: { content } },
            settings: {
                outputSelection: { '*': { '*': ['*'] } },
                optimizer: { enabled: true, runs: 200 }
            }
        };

        function findImports(importPath) {
            try {
                // Check root node_modules
                const rootNodeModules = path.join(process.cwd(), 'node_modules', importPath);
                if (fs.existsSync(rootNodeModules)) return { contents: fs.readFileSync(rootNodeModules, 'utf8') };

                // Check contracts/node_modules
                const contractsNodeModules = path.join(process.cwd(), 'contracts', 'node_modules', importPath);
                if (fs.existsSync(contractsNodeModules)) return { contents: fs.readFileSync(contractsNodeModules, 'utf8') };

                return { error: 'File not found' };
            } catch (e) {
                return { error: 'File not found' };
            }
        }

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(e => e.severity === 'error');
            if (errors.length > 0) {
                console.error("Compilation Errors:", errors);
                throw new Error("Compilation failed");
            }
        }
        return output.contracts[fileName][contractName];
    }

    // Compile LegacyToken
    console.log("\nCompiling LegacyToken...");
    const tokenContract = compile('LegacyToken', 'LegacyToken.sol');

    // Compile Testament
    console.log("Compiling Testament...");
    const testamentContract = compile('Testament', 'Testament.sol');

    // 3. Deploy
    console.log("\nDeploying LegacyToken...");
    const TokenFactory = new ethers.ContractFactory(tokenContract.abi, tokenContract.evm.bytecode, wallet);
    const token = await TokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ LegacyToken Deployed at: ${tokenAddress}`);

    console.log("\nDeploying Testament...");
    const TestamentFactory = new ethers.ContractFactory(testamentContract.abi, testamentContract.evm.bytecode, wallet);
    const testament = await TestamentFactory.deploy(tokenAddress);
    await testament.waitForDeployment();
    const testamentAddress = await testament.getAddress();
    console.log(`✅ Testament Deployed at: ${testamentAddress}`);

    // 4. Save Info to frontend/lib/contract-config.json (optional/helper)
    console.log(`\nDeployment Complete!`);
    console.log(`TOKEN: ${tokenAddress}`);
    console.log(`TESTAMENT: ${testamentAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
