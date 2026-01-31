const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

async function main() {
    // 1. Setup Provider and Wallet
    require('dotenv').config();
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("Private key not found");

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`Deploying from account: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} MON`);

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
        function findImports(path) {
            try {
                const nodeModulesPath = path.startsWith('@openzeppelin')
                    ? `node_modules/${path}`
                    : path;
                return { contents: fs.readFileSync(nodeModulesPath, 'utf8') };
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
    const tokenSource = fs.readFileSync('contracts/LegacyToken.sol', 'utf8');
    const tokenContract = compile('contracts/LegacyToken.sol', tokenSource).LegacyToken;

    // Read and Compile Testament
    const testamentSource = fs.readFileSync('contracts/Testament.sol', 'utf8');
    const testamentContract = compile('contracts/Testament.sol', testamentSource).Testament;

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
