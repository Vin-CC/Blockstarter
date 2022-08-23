import { ethers } from "ethers";
import CampaignJSON from "./contracts/Campaign.json";
import CampaignFactoryJSON from "./contracts/CampaignFactory.json";

import state from "./state";

const mainBlock = document.getElementById("main");
const connectButton =  document.getElementById("connect-button");
const connectedStatusLabel = document.getElementById("connected-status");

const CAMPAIGN_FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = {
    TOKEN: CampaignJSON.abi,
    FACTORY: CampaignFactoryJSON.abi
}

const getProvider = async () => {
    state.provider = new ethers.providers.Web3Provider(window.ethereum)
}

const isMetaMaskConnected = async () => {
    try {
        const accounts = await state.provider.listAccounts();
        return accounts.length > 0;
    } catch (error) {
        console.error("isMetaMaskConnected error:", error);
    }
}

const connectToContract = async () => {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        const campaignFactory = new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, ABI.FACTORY, signer);

        const deployedCampaigns = await campaignFactory.getDeployedCampaigns();
    } catch (err) {
        console.error("connectToContract error", err);
    }
}

window.connect = async function connect() {
    if (!state.isConnected) {
        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        // provider = new ethers.providers.Web3Provider(window.ethereum);

        // MetaMask requires requesting permission to connect users accounts
        await state.provider.send("eth_requestAccounts", []);

        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        state.signer = state.provider.getSigner();

        await connectToContract();
    }
}

async function init() {
    getProvider()
    if (state.provider) {
        state.isConnected = await isMetaMaskConnected()
        
        if (state.isConnected) {
            connectButton.innerText = "se déconnecter"

            await connectToContract()
        } else {
            connectButton.innerText = "se connecter"
        }
        connectedStatusLabel.innerText = state.isConnected
    } else {
        mainBlock.innerHTML = "<h1>Metamask n'est pas présent, installez le!</h1>"
    }
}

await init()