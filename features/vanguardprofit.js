const fs = require('fs');
const axios = require('axios');  // Utilisation d'axios pour les requêtes API

const DROP_TABLE = [
    { id: "DYE_FROSTBITTEN", chance: 0.0001, quantity: 1, useLowestBIN: true },
    { id: "SHATTERED_PENDANT", chance: 0.001464, quantity: 1, useLowestBIN: true },
    { id: "SKELETON_KEY", chance: 0.002928, quantity: 1 },
    { id: "UMBER_KEY", chance: 0.004880, quantity: 4 },
    { id: "TUNGSTEN_KEY", chance: 0.004880, quantity: 4 },
    { id: "MITHRIL_PLATE", chance: 0.014641, quantity: 1 },
    { id: "FINE_ONYX_GEM", chance: 0.019522, quantity: 160 },
    { id: "FINE_PERIDOT_GEM", chance: 0.019522, quantity: 160 },
    { id: "FINE_CITRINE_GEM", chance: 0.019522, quantity: 160 },
    { id: "FINE_AQUAMARINE_GEM", chance: 0.019522, quantity: 160 },
    { id: "GLACITE_AMALGAMATION", chance: 0.019522, quantity: 4 },
    { id: "UMBER_KEY", chance: 0.024402, quantity: 2 },
    { id: "TUNGSTEN_KEY", chance: 0.024402, quantity: 2 },
    { id: "DWARVEN_OS_METALLIC_MINIS", chance: 0.024402, quantity: 1 },
    { id: "UMBER_PLATE", chance: 0.024402, quantity: 1 },
    { id: "TUNGSTEN_PLATE", chance: 0.024402, quantity: 1 },
    { id: "REFINED_MITHRIL", chance: 0.029283, quantity: 2 },
    { id: "REFINED_TITANIUM", chance: 0.029283, quantity: 2 },
    { id: "GOBLIN_EGG_BLUE", chance: 0.034163, quantity: 4 },
    { id: "FLAWLESS_ONYX_GEM", chance: 0.039043, quantity: 1 },
    { id: "FLAWLESS_PERIDOT_GEM", chance: 0.039043, quantity: 1 },
    { id: "FLAWLESS_CITRINE_GEM", chance: 0.039043, quantity: 1 },
    { id: "FLAWLESS_AQUAMARINE_GEM", chance: 0.039043, quantity: 1 },
    { id: "REFINED_UMBER", chance: 0.039043, quantity: 2 },
    { id: "REFINED_TUNGSTEN", chance: 0.039043, quantity: 2 },
    { id: "GLACITE_AMALGAMATION", chance: 0.039043, quantity: 2 },
    { id: "UMBER_KEY", chance: 0.048804, quantity: 1 },
    { id: "TUNGSTEN_KEY", chance: 0.048804, quantity: 1 },
    { id: "GOBLIN_EGG_BLUE", chance: 0.068326, quantity: 2 },
    { id: "SUSPICIOUS_SCRAP", chance: 0.073206, quantity: 4 },
    { id: "ENCHANTMENT_ICE_COLD_1", chance: 0.073206, quantity: 1 },
    { id: "BEJEWELED_HANDLE", chance: 0.073206, quantity: 4 },
];

const ROLLS_PER_KEY = 6.7;

// Fonction pour récupérer les prix depuis l'API et effectuer les calculs
async function fetchAndUpdatePrices() {
    try {
        // Récupérer les prix du bazar
        const bazaarResponse = await axios.get('https://api.hypixel.net/v2/skyblock/bazaar');
        const bazaarData = bazaarResponse.data.products;

        // Récupérer les prix du AH
        const lowestBinResponse = await axios.get('https://moulberry.codes/lowestbin.json');
        const lowestBinData = lowestBinResponse.data;

        let prices = {};
        let totalEV = 0;
        let totalEV2 = 0;

        DROP_TABLE.forEach(drop => {
            const quantity = drop.quantity || 1;
            let price = 0;
            let price2 = 0;
            let source = "";

            if (drop.useLowestBIN) {
                price = lowestBinData[drop.id]?.sellPrice || 0;
                price2 = lowestBinData[drop.id]?.buyPrice || 0;
                source = "BIN";
            } else {
                const product = bazaarData[drop.id];
                if (product && product.quick_status) {
                    price = product.quick_status.sellPrice || 0;
                    price2 = product.quick_status.buyPrice || 0;
                    source = "Bazaar";
                }
            }

            // Calcul pour le totalEV (prix de vente)
            if (price) {
                const totalSellValue = price * quantity;
                const contribution = drop.chance * totalSellValue * ROLLS_PER_KEY;
                totalEV += contribution;
            }

            // Calcul pour le totalEV2 (prix d'achat)
            if (price2) {
                const totalSellValue2 = price2 * quantity;
                const contribution2 = drop.chance * totalSellValue2 * ROLLS_PER_KEY;
                totalEV2 += contribution2;
            }

            // Sauvegarder les prix et autres données dans le fichier JSON sans inclure les totaux
            prices[drop.id] = {
                sellPrice: price,
                buyPrice: price2,
            };
        });

        // Sauvegarder les résultats dans le fichier JSON (sans les totaux dans les éléments individuels)
        fs.writeFileSync('./config/prices.json', JSON.stringify(prices, null, 2));

        // Sauvegarder les totaux séparément dans un objet à part dans un fichier JSON
        const totals = {
            totalEV,
            totalEV2,
        };

        fs.writeFileSync('./config/totals.json', JSON.stringify(totals, null, 2));

        console.log("Prices and profitability calculations updated and saved.");

    } catch (error) {
        console.error("Error fetching prices: ", error);
    }
}

// Mise à jour des prix toutes les 5 minutes
setInterval(fetchAndUpdatePrices, 300000);  // 5 minutes
fetchAndUpdatePrices();  // Appel initial
