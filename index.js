const fs = require('fs');
const { ChatLib } = require('chatlib');  // Assurez-vous d'utiliser correctement votre méthode d'accès à `ChatLib`

// Fonction pour afficher les résultats des prix
function displayPrices(command) {
    try {
        // Lire les données de prix depuis le fichier JSON
        const pricesData = JSON.parse(fs.readFileSync('./config/prices.json'));

        // Récupérer les informations nécessaires
        const keyBuyPrice = pricesData.keyBuyPrice;
        const totalEV = pricesData.totalEV;
        const totalEV2 = pricesData.totalEV2;

        // Préparer la réponse à afficher
        let response = 'Calculs de rentabilité:\n';

        // Affichage des résultats pour la commande sell_offer
        if (command === 'sell_offer') {
            response += `>> Total EV (sell): ${totalEV.toFixed(2)} coins\n`;
            response += `>> Expected sell order Value (6.7 rolls): ${totalEV.toFixed(2)} coins\n`;

            if (totalEV > keyBuyPrice) {
                response += `✔ PROFITABLE! sell order Gain: +${(totalEV - keyBuyPrice).toFixed(2)} coins\n`;
            } else {
                response += `✘ Not profitable. sell order Loss: -${(keyBuyPrice - totalEV).toFixed(2)} coins\n`;
            }
        }

        // Affichage des résultats pour la commande insta_sell
        if (command === 'insta_sell') {
            response += `>> Total EV2 (buy): ${totalEV2.toFixed(2)} coins\n`;
            response += `>> Expected instant sell Value (6.7 rolls): ${totalEV2.toFixed(2)} coins\n`;

            if (totalEV2 > keyBuyPrice) {
                response += `✔ PROFITABLE! instant sell Gain: +${(totalEV2 - keyBuyPrice).toFixed(2)} coins\n`;
            } else {
                response += `✘ Not profitable. instant sell Loss: -${(keyBuyPrice - totalEV2).toFixed(2)} coins\n`;
            }
        }

        // Afficher les résultats dans le chat
        ChatLib.chat(response);

    } catch (error) {
        console.error("Error reading prices or totals: ", error);
    }
}

// Enregistrement de la commande /vanguardprices sell_offer
register("command", (user) => {
    displayPrices("sell_offer");
}).setName("vanguardprices sell_offer");

// Enregistrement de la commande /vanguardprices insta_sell
register("command", (user) => {
    displayPrices("insta_sell");
}).setName("vanguardprices insta_sell");
