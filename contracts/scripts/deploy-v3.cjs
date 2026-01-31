const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

async function main() {
    // 1. Setup Provider and Wallet
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("Private key not found");

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`Deploying from account: ${wallet.address}`);
    try {
        const balance = await provider.getBalance(wallet.address);
        console.log(`Account balance: ${ethers.formatEther(balance)} MON`);
    } catch (e) {
        console.log("Could not fetch balance, proceeding...");
    }

    // 2. Compile Contracts (LegacyToken & Testament)
    console.log("\nCompiling contracts...");

    function compile(filename, content) {
        const input = {
            language: 'Solidity',
            sources: { [filename]: { content } },
            settings: {
                outputSelection: {
                    '*': { '*': ['*'] }
                },
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        };

        // Add OpenZeppelin imports handling
        function findImports(importPath) {
            try {
                // Adjust path to find node_modules in the parent directory of contracts
                const nodeModulesPath = path.join(__dirname, '../node_modules', importPath);
                if (fs.existsSync(nodeModulesPath)) {
                    return { contents: fs.readFileSync(nodeModulesPath, 'utf8') };
                }
                // Try alternate path (root node_modules)
                const rootNodeModules = path.join(__dirname, '../../node_modules', importPath);
                if (fs.existsSync(rootNodeModules)) {
                    return { contents: fs.readFileSync(rootNodeModules, 'utf8') };
                }
                // Try relative to contracts folder
                const contractsNodeModules = path.join(__dirname, '../contracts/node_modules', importPath);
                if (fs.existsSync(contractsNodeModules)) {
                    return { contents: fs.readFileSync(contractsNodeModules, 'utf8') };
                }

                return { error: 'File not found' };
            } catch (e) {
                return { error: 'File not found' };
            }
        }

        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

        if (output.errors) {
            const errors = output.errors.filter(e => e.severity === 'error');
            if (errors.length > 0) {
                console.error(errors);
                throw new Error("Compilation failed");
            }
        }
        return output.contracts[filename];
    }

    // Read and Compile LegacyToken
    const contractsDir = path.join(__dirname, '../contracts');
    const tokenSource = fs.readFileSync(path.join(contractsDir, 'LegacyToken.sol'), 'utf8');
    const tokenContract = compile('LegacyToken.sol', tokenSource).LegacyToken;

    // Read and Compile Testament
    const testamentSource = fs.readFileSync(path.join(contractsDir, 'Testament.sol'), 'utf8');
    const testamentContract = compile('Testament.sol', testamentSource).Testament;

    // 3. Deploy LegacyToken
    console.log("\nDeploying LegacyToken...");
    const TokenFactory = new ethers.ContractFactory(tokenContract.abi, tokenContract.evm.bytecode, wallet);
    const token = await TokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ LegacyToken Deployed at: ${tokenAddress}`);

    // 4. Deploy Testament (linked to Token)
    console.log("\nDeploying Testament...");
    const TestamentFactory = new ethers.ContractFactory(testamentContract.abi, testamentContract.evm.bytecode, wallet);
    const testament = await TestamentFactory.deploy(tokenAddress);
    await testament.waitForDeployment();
    const testamentAddress = await testament.getAddress();
    console.log(`✅ Testament Deployed at: ${testamentAddress}`);

    // 5. Save Deployment Info
    const deploymentInfo = {
        network: "monadTestnet",
        chainId: 10143,
        deployer: wallet.address,
        tokenAddress: tokenAddress,
        testamentAddress: testamentAddress,
        timestamp: new Date().toISOString()
    };

    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir);

    fs.writeFileSync(
        path.join(deploymentsDir, 'monadTestnet-v3.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\nDeployment info saved to deployments/monadTestnet-v3.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
