const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const API = require('../wf-market-api.js');
const fs = require('fs');
const path = require('path');
// Import utils.js
const utils = require('../utilities/utils.js');
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
        const modNameNoSpace = utils.replaceSpaceWithUnderscore(modName);
        const desiredPrice = interaction.options.getString('desired-price');

        // Get user data
        const interactionUser = await interaction.guild.members.fetch(interaction.user.id)

        const nickName = interactionUser.nickname
        const userName = interactionUser.user.username
        const userId = interactionUser.id

        // Get mod data
        const modData = await API.getItemOrdersByName(modNameNoSpace)
            .then(data => data)
            .catch(error => {
                if (error.response.status === 404) {
                    interaction.reply({ content: 'Mod not found.', ephemeral: true });
                } else {
                    interaction.reply({ content: 'Something went wrong.', ephemeral: true });
                    log(console.error(error));
                }

                return Promise.reject(error);
            });

        // Check thge result of the API call
        if (modData === null || modData === undefined || !modData.payload || !modData.payload.orders) {
            // If the API call failed, return
            return;
        }
        const lowestPlatinumPrice = utils.getLowestPlatinumPrice(modData);

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
        while (utils.checkItemIdExist(listData, id)) {
            id++;
        }


        const modNameOutput = utils.makeFirstLettersUpper(modName);
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
            // Change check to start (save time)
            // If check is by different user allow 
            if (!itemExists) {
                // Log user and mod to console
                log('User: ' + userName + ' | Mod: ' + modNameOutput + ' | Desired Price: ' + desiredPrice);
                utils.addItemToList(id, modNameNoSpace, desiredPrice, userName, listData, listFilePath);
            }
        } catch (err) {
            console.error(err);
        }
    },
};