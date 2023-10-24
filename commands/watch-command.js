const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const API = require('../wf-market-api.js');
const fs = require('fs');
const path = require('path');
// Import utils.js
const { replaceSpaceWithUnderscore, getLowestPlatinumPrice, checkJsonFileExist, createJsonFile, readJsonFile, createUserInJson, checkItemIdExist, makeFirstLettersUpper, addItemToJson, updateJsonFile } = require('../utilities/utils.js');
// logger.js
const { log } = require('../utilities/logger.js');

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
        const desiredPriceToNumber = parseInt(desiredPrice);

        // Get user data
        const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
        const username = interactionUser.user.username;
        const userId = interactionUser.id;

        // Get mod data
        const modData = await API.getItemOrdersByName(modNameNoSpace).then(data => data);

        // Check modData
        if (modData === 404) {
            interaction.reply({ content: 'Mod not found.', ephemeral: true });
            return;
        } else if (modData === -1) {
            interaction.reply({ content: 'Evgenii broke me as usual. <3', ephemeral: true });
        }
        
        // Check the result of the API call
        if (!modData || !modData.payload || !modData.payload.orders) {
            // If the API call failed, return
            return;
        }
        const lowestPlatinumPrice = getLowestPlatinumPrice(modData);

        // Date
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);

        // JSON
        // Check if JSON file exists, if not, create it
        createJsonFile();

        // Read the contents of list.json
        const listData = readJsonFile();

        // Check if the user exists in the JSON file, if not, create it
        if (!listData.hasOwnProperty(userId)) {
            createUserInJson(userId, username, listData);
        }

        // Check if the item exists within the specific user's items
        const userItems = listData[userId].items;
        const itemToCheck = modNameNoSpace;
        const itemExists = userItems.some((item) => item.item_name === itemToCheck);

        // ID stuff
        let id = 1; // Start with an initial ID

        // While ID exists for the specific user, increment it
        while (checkItemIdExist(listData[userId], id)) {
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

            // If successful, add mod to the list
            // Change check to start (save time)
            // If check is by a different user, allow
            if (!itemExists) {
                // Log user and mod to console
                log('User: ' + username + ' | Mod: ' + modNameOutput + ' | Desired Price: ' + desiredPriceToNumber);
                addItemToJson(id, modNameNoSpace, desiredPriceToNumber, userId, username, listData);
                updateJsonFile(listData);
            }
        } catch (err) {
            console.error(err);
        }
    },
};
