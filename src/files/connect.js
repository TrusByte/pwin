import UniversalProvider from 'https://esm.sh/@walletconnect/universal-provider@2.11.0'

const projectId = '1cdaaafe519b4ff320a7a6e2afa17e2d'

let provider;

document.getElementById('connectBtn').onclick = async () => {

    provider = await UniversalProvider.init({
        projectId,
        metadata: {
            name: 'My DApp',
            description: 'Clean WC',
            url: window.location.origin,
            icons: []
        }
    })

    // 👇 LISTEN FOR URI
    provider.on("display_uri", (uri) => {
        console.log("WalletConnect URI:", uri)

        // 👉 Option 1: open MetaMask mobile
        window.location.href = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`

        // 👉 Option 2: Trust Wallet
        // window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`

        // 👉 Option 3 (desktop): show QR (you must implement)
    })

    await provider.connect({
        namespaces: {
            eip155: {
                methods: [
                    'eth_sendTransaction',
                    'eth_sign',
                    'eth_requestAccounts'
                ],
                chains: ['eip155:1'], // or polygon
                events: ['accountsChanged', 'chainChanged']
            }
        }
    })

    console.log("Connected:", provider.accounts)
}