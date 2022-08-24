
export const disableButton = (btn) => {
    btn.setAttribute("aria-busy", true)
    btn.setAttribute("disabled", true)
}

export const enableButton = (btn) => {
    btn.removeAttribute("aria-busy")
    btn.removeAttribute("disabled")
}

export const drawCampaignCard = (campaign) => { 
    const article = document.createElement("article");
    if (campaign.name) {
        const title = document.createElement("h3");
        title.innerText = campaign.name;

        if (campaign.symbol) {
            title.innerText = title.innerText + " - " + campaign.symbol
        }

        article.appendChild(title);
    }
    const paragraph = document.createElement("p");
    paragraph.innerText = campaign.address;
    article.appendChild(paragraph);

    const link = document.createElement("a");
    link.innerText = "Détail"
    link.href = `src/pages/campaign.html?addressCampaign=${campaign.address}`
    article.appendChild(link);
    
    return article
}