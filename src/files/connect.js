import { createWeb3Modal, defaultWagmiConfig } from 'https://unpkg.com/@web3modal/wagmi@latest/dist/index.js'
import { mainnet, polygon } from 'https://unpkg.com/wagmi/chains@latest/dist/index.js'

// 🔑 Replace with your WalletConnect Project ID
const projectId = '1cdaaafe519b4ff320a7a6e2afa17e2d'

// App metadata (important for wallet display)
const metadata = {
    name: 'PrimeWIN',
    description: 'WalletConnect for PrimeWIN',
    url: window.location.origin,
    icons: []
}

// Configure chains
const chains = [mainnet, polygon]

// Create wagmi config
const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata
})

// Initialize modal
createWeb3Modal({
    wagmiConfig,
    projectId,
    themeMode: 'light'
})

// Optional: manual button trigger
// document.getElementById('connectBtn').onclick = () => {
//     document.querySelector('w3m-button').click()
// }