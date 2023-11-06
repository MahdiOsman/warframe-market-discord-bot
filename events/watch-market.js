// Read JSON file for mods to watch and their prices and compare them to the current prices using the Warframe Market API.
const fs = require('fs');
const path = require('path');
// API
const API = require('../wf-market-api.js');
// Config
const { mahdiChatID, evgeniiChatID } = require('../config.json');
// Utils
const { getLowestPlatinumPrice, removeItemFromJson, removeUnderscore, makeFirstLettersUpper, checkJsonFileExist, updateJsonFile } = require('../utilities/utils.js');
const { log } = require('../utilities/logger.js');

// Function to compare the list.json data with the API prices
async function compareDataWithAPI(bot, jsonData) {
    if (!checkJsonFileExist()) {
        log('File does not exist');
        return;
    }

    // Log initial message
    log('Comparing data with API...');

    // Loop through each user in the JSON data
    for (const user in jsonData) {
        const username = jsonData[user].username;
        const userItems = jsonData[user].items;

        for (let i = 0; i < userItems.length; i++) {
            const item = userItems[i];
            const apiData = await API.getItemOrdersByName(item.item_name);

            // Check if the API call was successful
            if (apiData) {
                const lowestPrice = getLowestPlatinumPrice(apiData);

                // Update the item's price in the user's list
                item.current_market_price = lowestPrice;

                // Compare the prices and take action if needed
                if (lowestPrice !== null && lowestPrice <= item.item_price) {
                    log("Price of " + item.item_name + " has dropped to " + lowestPrice + "p.");

                    // Remove the item from the user's list if consistent is false
                    if (!item.consistent)
                        removeItemFromJson(item.id, user, jsonData);

                    // Send telegram message to the user
                    if (username === "theillusions") {
                        log('Sending message to ' + username + '...');
                        bot.sendMessage(mahdiChatID, 'Price of ' + makeFirstLettersUpper(removeUnderscore(item.item_name)) + ' has dropped to ' + lowestPrice + 'p.');
                        log('Message sent.');
                    } else if (username === "theasuna") {
                        log('Sending message to ' + username + '...');
                        bot.sendMessage(evgeniiChatID, 'Price of ' + makeFirstLettersUpper(removeUnderscore(item.item_name)) + ' has dropped to ' + lowestPrice + 'p.');
                        log('Message sent.');
                    }
                }
            }
        }
    }

    // Write the updated JSON data back to the file
    updateJsonFile(jsonData);

    // Log completion message
    log('Comparison completed.');
}



module.exports = {
    name: 'watch-market',
    execute(bot, jsonData) {
        compareDataWithAPI(bot, jsonData);
    }
};