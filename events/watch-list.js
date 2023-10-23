// Read JSON file for mods to watch and their prices and compare them to the current prices using the Warframe Market API.
const fs = require('fs');
const path = require('path');
const API = require('../wf-market-api.js');
const { mahdiChatID, evgeniiChatID } = require('../config.json');

const filePath = path.join(__dirname, 'watch-list.json');
const watchList = JSON.parse(fs.readFileSync(filePath));

// Compare them to the current prices using the Warframe Market API
async function checkPrices() {
    // Get current prices
    const currentPrices = await API.getItemOrdersByName('fury');

    // Compare prices
    for (const mod of watchList) {
        const modName = mod.name;
        const modPrice = mod.price;

        const modData = await API.getItemOrdersByName(modName);

        if (modData.payload.orders[0].platinum <= modPrice) {
            // Send message to telegram bot
            bot.sendMessage(mahdiChatID, `The mod ${modName} is at or below ${modPrice}p.`);
            bot.sendMessage(evgeniiChatID, `The mod ${modName} is at or below ${modPrice}p.`);
        }
    }
}