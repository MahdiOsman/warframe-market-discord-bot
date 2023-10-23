const fs = require('fs');

/**
 * Check if an item with the given ID exists in the JSON data.
 * @param {Object} jsonData - The JSON data to search in.
 * @param {number} itemIdToCheck - The ID to check for.
 * @returns {boolean} - True if the item with the given ID exists, false otherwise.
 */
function checkIdExist(jsonData, itemIdToCheck) {
    const itemExists = jsonData.items.some((item) => item.id === itemIdToCheck);
    return itemExists;
}

/**
 * Add a mod to the watch list in the JSON data.
 * @param {number} modId - The ID of the mod to add.
 * @param {string} modName - The name of the mod to add.
 * @param {string} modPrice - The desired price for the mod.
 * @param {Object} jsonData - The JSON data to update.
 * @param {string} listFilePath - The path to the list JSON file.
 */
function addModToList(modId, modName, modPrice, user, jsonData, listFilePath) {
    // If mod does not exist, add it
    jsonData.items.push({
        id: modId,
        item_name: modName,
        item_price: modPrice,
        check_flag: false, // Default
        current_market_price: 0, // Default
        created_by_user: user
    });

    // Write the updated data back to list.json
    fs.writeFileSync(listFilePath, JSON.stringify(jsonData, null, 2));
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
        if (order.platinum < lowestPlatinumPrice) {
            lowestPlatinumPrice = order.platinum;
        }
    }

    return lowestPlatinumPrice;
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


// Export modules
module.exports = {
    checkIdExist,
    addModToList,
    replaceSpaceWithUnderscore,
    toString,
    replaceSpaceWithUnderscore,
    getLowestPlatinumPrice,
    makeFirstLettersUpper
}