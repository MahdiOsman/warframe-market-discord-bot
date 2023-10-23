const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const API = require('../wf-market-api.js');
const fs = require('fs');
const path = require('path');

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
function addModToList(modId, modName, modPrice, jsonData, listFilePath) {
    // If mod does not exist, add it
    jsonData.items.push({
        id: modId,
        item_name: modName,
        item_price: modPrice,
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

// Slash Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('watch')
        .setDescription('Watch a specific mod.')
        .addStringOption(option => option.setName('mod')
            .setDescription('The mod to watch.')
            .setRequired(true))
        .addStringOption(option => option.setName('desired-price')
            .setDescription('The price to watch.')
            .setRequired(true)),
    async execute(interaction) {
        // Get mod name and price
        const modName = interaction.options.getString('mod');
        const modNameNoSpace = replaceSpaceWithUnderscore(modName);
        const desiredPrice = interaction.options.getString('desired-price');

        // Get mod data
        const modData = await API.getItemOrdersByName(modNameNoSpace)
                        .then(data => data)
                        .catch(error => {
                            if (error.response.status === 404) {
                                interaction.reply({ content: 'Mod not found.', ephemeral: true });
                            } else {
                                interaction.reply({ content: 'Something went wrong.', ephemeral: true });
                                console.error(error);
                            }

                            return Promise.reject(error);
                        });

        // Check thge result of the API call
        if (modData === null) {
            // If the API call failed, return
            return;
        }
        const lowestPlatinumPrice = getLowestPlatinumPrice(modData);

        // Date
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);

        // JSON
        const dataDirectory = path.join(__dirname, '../data');
        const listFilePath = path.join(dataDirectory, 'list.json');

        // Check if watch-list.json exists, if not create it
        if (!fs.existsSync(dataDirectory)) {
            fs.mkdirSync(dataDirectory);
        }
        if (!fs.existsSync(listFilePath)) {
            const initialData = {
                items: [],
            };
            fs.writeFileSync(listFilePath, JSON.stringify(initialData, null, 2)); // 2 spaces for indentation
        }

        // Read the contents of list.json
        const listData = JSON.parse(fs.readFileSync(listFilePath, 'utf8'));
        // Check mod exists within the items array
        const itemToCheck = modNameNoSpace;
        const itemExists = listData.items.some((item) => item.item_name === itemToCheck);
        // ID stuff
        const id = listData.items.length + 1;

        // While ID exists, increment it
        while (checkIdExist(listData, id)) {
            id++;
        }


        const modNameOutput = makeFirstLettersUpper(modName);
        // Format Embed
        const replyEmbed = new EmbedBuilder()
            .setColor('Blue') // Blue
            .setTitle('Warframe Market')
            .addFields(
                {
                    name: 'Watching',
                    value: modNameOutput,
                },
                {
                    name: 'Desired Price',
                    value: desiredPrice,
                    inline: true,
                },
                {
                    name: 'Current Price',
                    value: lowestPlatinumPrice ? lowestPlatinumPrice.toString() : 'Could not find price for this mod.',
                    inline: true,
                },
            )
            .setFooter({ text: today.toUTCString() });

        // Bot Reply
        try {
            await interaction.reply({ embeds: [replyEmbed] });

            // If successful, add mod to list
            if (!itemExists) {
                addModToList(id, modNameNoSpace, desiredPrice, listData, listFilePath);
            }
        } catch (err) {
            console.error(err);
        }
    },
};