// Description: Main file for the bot
const fs = require('node:fs');
const path = require('node:path');

// Discord bot
const { Client, Collection, GatewayIntentBits, ActivityType } = require('discord.js');
const { discordToken } = require('./config.json');

// Telegram bot
const TelegramBot = require('node-telegram-bot-api');
const { telegramToken, mahdiChatID, evgeniiChatID } = require('./config.json');
const bot = new TelegramBot(telegramToken, { polling: true });

// Utils
const { log } = require('./utilities/logger.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    client.user.setPresence({
        activities: [{ name: 'you make some plat.', type: ActivityType.Watching }],
        status: 'dnd',
    });
    log('Bot is ready!');

});

// Listen for new messages
client.on('messageCreate', async message => {
    // Send message to telegram bot
    // Mahdi
    if (message.author.id == "1162923617164722256") {
        bot.sendMessage(mahdiChatID, message.content);
    }
    // Evgenii
    if (message.author.id == "1163511421783507015") {
        bot.sendMessage(evgeniiChatID, message.content);
    }
});

// Listen for interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        log(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// EVENTS
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.name === 'watch-market') {
        // Scheudle event to run every 10 minutes
        setInterval(() => {
            event.execute(bot);
        }, 60 * 10 * 1000);
    } else {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

    // Login to Discord with your client's token
    client.login(discordToken);