const { ethers } = require("ethers");
const fs = require("fs");

// Load ABI from file
const file = JSON.parse(fs.readFileSync("./abi.json", "utf8"));
const abi = file.abi;

// RPC (example: Polygon)
const RPC_URL = "https://rpc-amoy.polygon.technology/";

// Contract address
const CONTRACT_ADDRESS = "0xfE08B0C2fEd31d54960471596EEfC91Ab9EA01fA";

async function main() {
    // Create provider
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    // Call read function
    const value = await contract.primeAddress(); // 👈 variable name
    console.log("Value:", value.toString());
}

main();