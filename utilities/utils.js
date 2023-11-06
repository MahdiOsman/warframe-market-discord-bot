const { log } = require('./logger.js');
const fs = require('fs');
const path = require('path');

const jsonFileName = 'items.json';

// JSON file
// Get the JSON file directory
function getJsonFileDirectory() {
    return path.join(__dirname, '../data');
}

// Check if the JSON file exists
function checkJsonFileExist() {
    const jsonFilePath = path.join(getJsonFileDirectory(), jsonFileName);
    return fs.existsSync(jsonFilePath);
}

// Create the JSON file with initial data if it doesn't exist
function createJsonFile() {
    const dataDirectory = getJsonFileDirectory();
    const jsonFilePath = path.join(dataDirectory, jsonFileName);

    // Check if the JSON file exists
    if (!checkJsonFileExist()) {
        // Create the data directory if it doesn't exist
        if (!fs.existsSync(dataDirectory)) {
            fs.mkdirSync(dataDirectory);
        }

        log('Creating items.json file...');
        const initialJsonData = {
            user1: {
                items: []
            }
        };
        fs.writeFileSync(jsonFilePath, JSON.stringify(initialJsonData, null, 2)); // 2 spaces for indentation
    }
}

// Read data from the JSON file
function readJsonFile() {
    const jsonFilePath = path.join(getJsonFileDirectory(), jsonFileName);
    if (checkJsonFileExist()) {
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        return jsonData;
    } else {
        return null; // Return null if the file doesn't exist
    }
}

// Update the JSON file with new data
function updateJsonFile(jsonData) {
    const jsonFilePath = path.join(getJsonFileDirectory(), jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2)); // 2 spaces for indentation
}

/**
 * Check if an item with the given ID exists in the JSON data.
 * @param {Object} jsonData - The JSON data to search in.
 * @param {number} itemIdToCheck - The ID to check for.
 * @returns {boolean} - True if the item with the given ID exists, false otherwise.
 */
function checkItemIdExist(jsonData, itemIdToCheck) {
    const itemExists = jsonData.items.some((item) => item.id === itemIdToCheck);
    return itemExists;
}

// Function to create a user within the jsonData
function createUserInJson(userId, username, jsonData) {
    if (!jsonData) {
        jsonData = {}; // Initialize jsonData if it's undefined
    }
    jsonData[userId] = {
        username: username,
        items: []
    };
}

// Function to add an item to the user's items
function addItemToJson(modId, modName, modPrice, userId, username, jsonData, consistent) {
    if (!jsonData) {
        jsonData = {}; // Initialize jsonData if it's undefined
    }

    // If the user doesn't exist in jsonData, create it
    if (!jsonData.hasOwnProperty(userId)) {
        createUserInJson(userId, username, jsonData);
    }

    // Add the item to the user's items
    jsonData[userId].items.push({
        id: modId,
        item_name: modName,
        item_price: modPrice,
        current_market_price: 0, // Default
        consistent: consistent, // Default
        order_type: 'sell', // Default
    });
}

/**
 * Get the order with the lowest platinum price from the given JSON data.
 * @param {Object} jsonData - The JSON data containing order information.
 * @returns {number|null} - The lowest platinum price or null if no valid data is found.
 */
function getLowestPlatinumPrice(jsonData) {
    if (!jsonData || !jsonData.payload || !jsonData.payload.orders || jsonData.payload.orders.length === 0) {
        return null; // Return null if the JSON data is invalid or empty
    }

    // Initialize the lowestPlatinumPrice with the platinum value of the first order
    let lowestPlatinumPrice = jsonData.payload.orders[0].platinum;

    // Loop through the orders to find the lowest platinum price
    for (const order of jsonData.payload.orders) {
        if (order.order_type === 'sell' && order.user.status == 'ingame') {
            if (order.platinum < lowestPlatinumPrice) {
                lowestPlatinumPrice = order.platinum;
            }
        }
    }

    return lowestPlatinumPrice;
}

// Get item name by id
function getItemById(itemId, user, jsonData) {
    if (jsonData.hasOwnProperty(user)) {
        const userItems = jsonData[user].items;
        const index = userItems.findIndex((item) => item.id === itemId);

        if (index !== -1) {
            return userItems[index].item_name;
        }
    }

    return null;
}

// Remove item from json
function removeItemFromJson(itemID, user, jsonData) {
    log(`Removing item with ID ${getItemById(itemID, user, jsonData)} from ${user}'s list...`);

    if (jsonData.hasOwnProperty(user)) {
        const userItems = jsonData[user].items;
        const index = userItems.findIndex((item) => item.id === itemID);

        if (index !== -1) {
            userItems.splice(index, 1);
            log(`Item with ID ${itemID} removed from ${user}'s list.`);
        } else {
            log(`Item with ID ${itemID} not found in ${user}'s list.`);
        }
    } else {
        log(`User ${user} not found in the data.`);
    }

    return jsonData; // Return the updated JSON data with potential changes
}

// To String
function toString(string) {
    return `${string}`
}

// Replace space with underscore
function replaceSpaceWithUnderscore(string) {
    return string.replace(/ /g, '_');
}

// Replace first letter of every word with uppercase
function makeFirstLettersUpper(string) {
    return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

// Replace first letter of every word with lowercase
function makeFirstLettersLower(string) {
    return string.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toLowerCase())));
}

// Remove underscore from string
function removeUnderscore(string) {
    return string.replace(/_/g, ' ');
}

// Export modules
module.exports = {
    checkItemIdExist,
    addItemToJson,
    replaceSpaceWithUnderscore,
    toString,
    makeFirstLettersLower,
    replaceSpaceWithUnderscore,
    getLowestPlatinumPrice,
    makeFirstLettersUpper,
    removeItemFromJson,
    removeUnderscore,
    addItemToJson,
    createJsonFile,
    checkJsonFileExist,
    readJsonFile,
    updateJsonFile,
    createUserInJson
}