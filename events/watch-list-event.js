// Read JSON file for mods to watch and their prices and compare them to the current prices using the Warframe Market API.
const fs = require('fs');
const path = require('path');
// API
const API = require('../wf-market-api.js');
// Config
const { mahdiChatID, evgeniiChatID } = require('../config.json');
// Utils
const { getLowestPlatinumPrice } = require('../utils.js');

// JSON file
const dataDirectory = path.join(__dirname, '../data');
const listFilePath = path.join(dataDirectory, 'list.json');

// @TODO: Check if price dropped -> Send message
//        If message sent -> Don't resend message
// Function to compare the list.json data with the API prices
async function compareDataWithAPI(bot) {
    if (!fs.existsSync(listFilePath)) {
        console.log('File does not exist');
        return;
    }

    // Read the contents of list.json
    const listData = JSON.parse(fs.readFileSync(listFilePath, 'utf8'));

    // Loop through the items in list.json
    for (const item of listData.items) {
        const apiData = await API.getItemOrdersByName(item.item_name);

        // Check if the API call was successful
        if (apiData) {
            const lowestPrice = getLowestPlatinumPrice(apiData);

            // Compare the prices and take action if needed
            if (lowestPrice !== null && lowestPrice < item.item_price) {
                console.log("Price of " + item.item_name + " has dropped to " + lowestPrice + "p.");

                if (item.created_by_user == "theillusions") {
                    item.check_flag = true; // Once checked flag 
                    // Send telegram message
                    bot.sendMessage(mahdiChatID, 'Price of ' + item.item_name + ' has dropped to ' + lowestPrice + 'p.');
                }
                if (item.created_by_user == "") {
                    item.check_flag = true; // Once checked flag
                    // Send telegram message
                    bot.sendMessage(evgeniiChatID, 'Price of ' + item.item_name + ' has dropped to ' + lowestPrice + 'p.');
                }
            }
        }
    }

    fs.writeFileSync(listFilePath, JSON.stringify(listData, null, 2)); // 2 spaces for indentation

    console.log('Comparison completed.');
}

module.exports = { compareDataWithAPI };