import { ethers } from "ethers";
import CampaignJSON from "./contracts/Campaign.json";
import CampaignFactoryJSON from "./contracts/CampaignFactory.json";

import { disableButton, enableButton, drawCampaignCard } from "./js/uiFunctions";
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
 * OTHERS FUNCTIONS
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

const getCampaingInstance = async (campaignAddress, needSigner = false) => {
    if (!campaignAddress) {
        return null
    }

    let role;
    if (needSigner) {
        role = state.signer
    } else {
        role = state.provider
    }
    return new ethers.Contract(campaignAddress, ABI.TOKEN, role);
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
        const campaignFactoryInstance = await getCampaignFactoryInstance();
        return await campaignFactoryInstance.getDeployedCampaigns();
    } catch (error) {
        console.error("getDeployedCampaigns error", error);
    }
}

const getDeployedCampaignsInformation = async (campaignAddressList) => {
    if (campaignAddressList.length === 0) {
        return []
    }

    try {
        let campaignList = []
        // for each campaign address, get the instance then call the contract's methods
        for (let i = 0; i < campaignAddressList.length; i++) {
            const campaignAddress = campaignAddressList[i];
            const campaignInstance = await getCampaingInstance(campaignAddress);
            const name = await campaignInstance.name();
            const symbol = await campaignInstance.symbol();

            campaignList.push({ name, address: campaignAddress, symbol })
        }
        return campaignList
    } catch (error) {
        console.error("getDeployedCampaignsInformation error", error);
    }
}

const showDeployedCampaigns = async () => {
    // Get the components
    let campaignListElement = document.getElementById("campaign-list");
    let nbCampaignsElems = document.getElementsByName("nb-campaigns");

    // Fetch informations only if there is a component to display them
    if (campaignListElement && nbCampaignsElems) {
        const deployedCampaigns = await getDeployedCampaigns();
        const listWithInformations = await getDeployedCampaignsInformation(deployedCampaigns);
        
        // get a htmlElement card for each campaign
        const elementsList = listWithInformations.map(campaign => drawCampaignCard(campaign))
        
        // display the number of campaigns
        nbCampaignsElems.forEach(elem => elem.innerText = deployedCampaigns.length)
        // display the campaign cards
        elementsList.forEach(elem => campaignListElement.appendChild(elem))
    }
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
    }
}

window.addCampaign = async function addCampaign(componnent) {
    if (state.isConnected ) {
        const errorComponent = document.getElementsByName("error-message-add-campaign");
        const nameInput = document.getElementById("name");
        const symbolInput = document.getElementById("symbol");
        const minimumInput = document.getElementById("minimum");
        const nameValue = nameInput.value;
        const symbolValue = symbolInput.value;
        const minimumValue = minimumInput.value;

        if (nameValue && symbolValue && minimumValue) {
            disableButton(componnent)
            
            errorComponent.forEach(cmp => cmp.hidden = true)

            try {
                const campaignFactoryInstance = await getCampaignFactoryInstance(true);
                await campaignFactoryInstance.createCampaign(minimumValue, nameValue, symbolValue);
                window.location = "/"
            } catch (error) {
                errorComponent.forEach(cmp => {
                    cmp.innerText = "Une erreur a eu lieu"
                    cmp.hidden = false
                })
            } finally {
                enableButton(componnent)
            }
        } else {
            errorComponent.forEach(cmp => {
                cmp.innerText = "Tous les champs sont obligatoires !"
                cmp.hidden = false
            })
        } 
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