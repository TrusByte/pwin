
let provider;
let signer;
let contract;
let contractUSDT;
let abi;
let walletConnection = false;
let prime_address = "No active Prime Address";
let pool_reward = 0.00;
let call_fees = 0.00;
let primeAddressExists = false;
let pol;
let lom = document.getElementById("loader")
let wallet_icon = document.getElementById("wallet_icon")

var overlay = false
let showWallet = false;
let wpm = document.getElementById("wallet_place")
let wam = document.getElementById("wallet_arrow")
function medAddress(address) {
    return address.slice(0, 8) + "....." + address.slice(-8);
}
async function connectClicked(showConnect) {
    if (showConnect) {
        overlay = true
        wpm.setAttribute("onclick", "connectClicked(false)")
        if (showWallet) {
            document.getElementById("disconnect_button").style.display = "none";
        }
        document.getElementById("wallet_overlay").style.display = "flex";
        wam.style.transform = "rotate(90deg)";
        document.getElementById("overlay-title").innerText = "Select Wallet";
    } else {
        overlay = false
        wpm.setAttribute("onclick", "connectClicked(true)")
        document.getElementById("wallet_overlay").style.display = "none";
        wam.style.transform = "rotate(0deg)";
    }
}


function isMobile() {
    // return /Android|iPhone/i.test(navigator.userAgent); 
    return window.innerWidth < 900;
    // return false
}
const contractAddress = "0xe85417eb08d47fd4E648230D286c43f04Fa23862";
if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => location.reload());
}
async function loadABI() {
    const response = await fetch("./abi.json");   // your ABI file
    const json = await response.json();
    abi = json.abi;              // must be JSON array
}




async function copyAddress(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert("Address Copied: " + text);
    } catch (err) {
        console.error("Copy failed", err);
    }
}
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        signer = null;
        contract = null;
        return;
    }
    const address = accounts[0];
    let wallet = `<div onclick="copyAddress('${address}')">${medAddress(address)}</div>`;

    document.getElementById("wallet_place").setAttribute("onclick", "showWallets()")
    document.getElementById("account_list").innerHTML = wallet;
    lom.style.display = "none"
    wallet_icon.style.display = "flex"
    document.getElementById("wallet_list").style.display = "none";
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    pol = await provider.getBalance(address);
    pool_reward = await contract.pool();
    prime_address = await contract.primeAddress()
    if (prime_address == "0x0000000000000000000000000000000000000000") {
        prime_address = "No active Prime Address"
    }
    call_fees = await contract.ENTRY_FEE()

    pol = formatUnits(pol, 18, 4);
    pool_reward = formatUnits(pool_reward, 18);
    call_fees = formatUnits(call_fees, 18)

    onWalletConnected(accounts, 0);
}


async function waitForEthereum() {
    return new Promise((resolve) => {
        if (window.ethereum) return resolve(window.ethereum);

        const checkInterval = setInterval(() => {
            if (window.ethereum) {
                clearInterval(checkInterval);
                resolve(window.ethereum);
            }
        }, 300);
    });
}



window.onload = async function () {
    const eth = await waitForEthereum();
    provider = new ethers.BrowserProvider(eth);
    await loadABI();

    try {
        // Only check connection, DO NOT request
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
            localStorage.setItem("walletConnected", "true");
            await handleAccountsChanged(accounts);
        } else {
            showConnectButton();
        }
    } catch (e) {
        showConnectButton();
    }
};


async function connectWallet(walletName) {
    wam.style.display = "none"
    lom.style.display = "flex"
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
    // Mobile deep links
    if (isMobile()) {
        if (walletName == "metamask") {
            window.location.href =
                "https://metamask.app.link/dapp/" + dappUrl.replace("https://", "");
            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        else if (walletName == "coinbase") {
            window.location.href =
                "https://go.cb-w.com/dapp?cb_url=" + encodedUrl;

            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        else if (walletName == "trustwallet") {
            window.location.href =
                "https://link.trustwallet.com/open_url?coin_id=60&url=" + encodedUrl;
            if (window.ethereum) {
                await provider.send("eth_requestAccounts", []);
                signer = await provider.getSigner();

                localStorage.setItem("walletConnected", "true"); // ADD THIS
                return;
            }
        }
        return;
    } else if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        localStorage.setItem("walletConnected", "true");


        const signer = await provider.getSigner();
        address = await signer.getAddress();
        await handleAccountsChanged(accounts)
    } else {
        alert("Install MetaMask, TrustWallet or Coinbase Wallet Extension");
    }
}

async function onWalletConnected(account, index) {
    wam.style.display = "flex"
    lom.style.display = "none"
    document.getElementById("pol_balance").innerText = pol;
    document.getElementById("reward_pool").innerText = `${pool_reward} POL`;
    document.getElementById("call_fees").innerText = `${call_fees} POL`;
    document.getElementById("call_fee").innerText = `${call_fees} POL`;
    document.getElementById("prime_address").innerText = prime_address;
    document.getElementById("wallet_place").setAttribute("onclick", "showWallets()");
    document.getElementById("wallet_arrow").style.display = "flex";
    document.getElementById("walletAddress").innerText = shortAddress(account[index], isMobile);
}

function showConnectButton() {
    wam.style.display = "flex"
    lom.style.display = "none"
    wallet_icon.style.display = "flex"
    document.getElementById("walletAddress").innerText = "Connect";
}


async function showWallets() {
    document.getElementById("wallet_list").style.display = "none"
    if (showWallet) {
        overlay = false
        document.getElementById("wallet_overlay").style.display = "none";
        document.getElementById("wallet_arrow").style.transform = "rotate(0deg)";
        document.getElementById("disconnect_button").style.display = "flex"
        showWallet = false;
    } else {
        overlay = true
        document.getElementById("wallet_overlay").style.display = "flex";
        document.getElementById("wallet_arrow").style.transform = "rotate(90deg)";
        showWallet = true;
    }
}

function disconnectWallet() {
    signer = null;
    contract = null;
    walletConnection = false;
    localStorage.removeItem("walletConnected");
    showConnectButton()
    document.getElementById("pol_balance").innerText = "0.00";
    document.getElementById("wallet_overlay").style.display = "none";
    document.getElementById("wallet_list").style.display = "flex"
    document.getElementById("account_list").style.display = "none"
    document.getElementById("wallet_list").style.flexDirection = "column"
    document.getElementById("wallet_arrow").style.rotate = "calc(90deg)";
    document.getElementById("wallet_place").setAttribute("onclick", "connectClicked(true)");
}

function hideOverlay() {
    if (overlay) {
        wpm.setAttribute("onclick", "connectClicked(true)")
        document.getElementById("wallet_overlay").style.display = "none";
        document.getElementById("disconnect_button").style.display = "flex"
        wam.style.transform = "rotate(0deg)";
    }
}


async function enterGame() {

    let txn_div = document.getElementById("txn_div");
    let txn_status = document.getElementById("txn_status");
    let txn_message = document.getElementById("txn_message");
    let txn_success = document.getElementById("check_circle");
    let txn_error = document.getElementById("error_icon");
    let spinner = document.getElementById("spinner");

    try {
        txn_div.style.display = "flex";
        txn_status.innerText = "Confirm Transaction Request"
        txn_message.innerText = "In order to enter the game, Please confirm transaction request with your wallet"
        const tx = await contract.enter({
            value: ethers.parseEther("1")
        });

        console.log("Tx sent:", tx.hash);

        const receipt = await tx.wait();

        console.log("Success:", receipt);

        txn_error.style.display = "none";
        spinner.style.display = "none";
        txn_success.style.display = "flex";
        txn_success.style.fill = "green"
        txn_status.innerText = "Successfull"
        txn_message.innerText = "Transaction Successfull, you will recieve confirmation within 1 minute"

        setTimeout(() => {
            txn_div.style.display = "none";
            txn_status.innerText = "Txn Pending"
            txn_error.style.display = "none";
            spinner.style.display = "flex";
            txn_success.style.display = "none";
            txn_status.innerText = "Confirm Transaction Request"
            txn_message.innerText = "In order to enter the game, Please confirm transaction request with your wallet"
        }, 10000)

    } catch (err) {
        txn_error.style.display = "flex";
        spinner.style.display = "none";
        txn_success.style.display = "none";
        txn_error.style.fill = "orangered";

        if (err?.info?.error?.message) {
            txn_status.innerText = "Txn Error"
            txn_message.innerText = err.info.error.message
            console.log("Revert:", err.info.error.message);
        }

        setTimeout(() => {
            txn_div.style.display = "none";
            txn_status.innerText = "Txn Pending"
            txn_error.style.display = "none";
            spinner.style.display = "flex";
            txn_success.style.display = "none";
            txn_status.innerText = "Confirm Transaction Request"
            txn_message.innerText = "In order to enter the game, Please confirm transaction request with your wallet"
        }, 10000)

        console.log("Message:", err?.info?.error?.message);
        console.log("Reason:", err?.reason);
        console.log("Code:", err?.code);
        console.log("Short:", err?.shortMessage);

    }

}