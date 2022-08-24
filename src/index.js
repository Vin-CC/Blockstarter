import { ethers } from "ethers";
import CampaignJSON from "./contracts/Campaign.json";
import CampaignFactoryJSON from "./contracts/CampaignFactory.json";

import state from "./state";

/**
 * CONSTANT
 */

const mainBlock = document.getElementById("main");
const connectButton =  document.getElementById("connect-button");
const addressP = document.getElementById("address");

const CAMPAIGN_FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = {
    TOKEN: CampaignJSON.abi,
    FACTORY: CampaignFactoryJSON.abi
}

/**
 * FUNCTIONS
 */

const getProvider = async () => {
    state.provider = new ethers.providers.Web3Provider(window.ethereum)
}

const getSigner = async () => {
    state.signer = state.provider.getSigner();
}

// Get an instance of the CampaignFactory contract
const getCampaignFactoryInstance = async (needSigner = false) => {
    let role;
    if (needSigner) {
        role = state.signer
    } else {
        role = state.provider
    }
    return new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, ABI.FACTORY, role);
}

// Check if the dApp is connected to MetaMask
const isMetaMaskConnected = async () => {
    try {
        const accounts = await state.provider.listAccounts();
        return accounts.length > 0;
    } catch (error) {
        console.error("isMetaMaskConnected error:", error);
    }
}

// Get the list of the deployes Campaigns
const getDeployedCampaigns = async () => {
    try {
        const campaignFactory = await getCampaignFactoryInstance();
        return await campaignFactory.getDeployedCampaigns();
    } catch (error) {
        console.error("getDeployedCampaigns error", error);
    }
}

const showDeployedCampaigns = async () => {
    const deployedCampaigns = await getDeployedCampaigns();
    let nbCampaignsElems = document.getElementsByName("nb-campaigns");
    nbCampaignsElems.forEach(elem => elem.innerText = deployedCampaigns.length)
}

// Update state and UI depending of the connection to MetaMask
const updateConnectState = async () => {
    state.isConnected = await isMetaMaskConnected()
    let connectedOnlyElems = document.getElementsByName("connected-only");
    let disconnectedOnlyElems = document.getElementsByName("disconnected-only");

    if (state.isConnected) {
        getSigner()
        const currentAddress = await state.signer.getAddress()

        connectedOnlyElems.forEach(elem => elem.hidden = false)
        disconnectedOnlyElems.forEach(elem => elem.hidden = true)
        addressP.innerText = `Connecté : ${currentAddress}`
    } else {
        connectedOnlyElems.forEach(doc => doc.hidden = true)
        disconnectedOnlyElems.forEach(doc => doc.hidden = false)
        connectButton.innerText = "Connexion"
    }
}

// Function that connect the dApp to MetaMask
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
        getSigner();
        console.log("state.signer", state.signer);
    }
}

window.addCampaign = async function addCampaign() {
    if (state.isConnected) {
        const campaignFactoryInstance = await getCampaignFactoryInstance(true);
        // uint _minimum, string memory _name, string memory _symbol)
        const nameInput = document.getElementById("name");
        const symbolInput = document.getElementById("symbol");
        const minimumInput = document.getElementById("minimum");
        const name = nameInput.value;
        const symbol = symbolInput.value;
        const minimum = minimumInput.value;
        console.log("name", name);
        console.log("symbol", symbol);
        console.log("minimum", minimum);
        campaignFactoryInstance.createCampaign(minimum, name, symbol);
    }
}

// Event accountsChanged throw when we disconnect the wallet from the dApp
window.ethereum.on("accountsChanged", (accounts) => {
    console.log("accountsChanged");
    updateConnectState()
})

// Init function
async function init() {
    //check if there is MetaMask installed on the browser
    getProvider()
    if (state.provider) {
        await updateConnectState()
        await showDeployedCampaigns()
    } else {
        mainBlock.innerHTML = "<h1>MetaMask n'est pas présent, installez le!</h1>"
    }
}

await init()