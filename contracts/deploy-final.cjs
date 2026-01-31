const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

async function main() {
    console.log("Starting deployment from contracts directory...");

    // 1. Setup Provider and Wallet
    // .env should be in the same directory as this script (contracts folder)
    const envPath = path.join(__dirname, '.env');
    require('dotenv').config({ path: envPath });

    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("Private key not found in .env");

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
        // Contracts are in ./contracts/ folder
        const filePath = path.join(process.cwd(), 'contracts', fileName);
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
                // Check local node_modules
                const localNodeModules = path.join(process.cwd(), 'node_modules', importPath);
                if (fs.existsSync(localNodeModules)) return { contents: fs.readFileSync(localNodeModules, 'utf8') };
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

    // 4. Deploy Testament
    console.log("\nDeploying Testament...");
    const TestamentFactory = new ethers.ContractFactory(testamentContract.abi, testamentContract.evm.bytecode, wallet);
    const testament = await TestamentFactory.deploy(tokenAddress);
    await testament.waitForDeployment();
    const testamentAddress = await testament.getAddress();
    console.log(`✅ Testament Deployed at: ${testamentAddress}`);

    console.log(`\nDeployment Complete!`);
    console.log(`TOKEN: ${tokenAddress}`);
    console.log(`TESTAMENT: ${testamentAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
