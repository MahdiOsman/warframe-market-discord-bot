// Warframe Market API
const axios = require('axios');
const { log } = require('./utilities/logger.js')

// Get all items
async function getAllItems() {
    const response = await axios.get('https://api.warframe.market/v1/items');
    return response.data;
}

// Get item by name
async function getItemByName(itemName) {
    const response = await axios.get(`https://api.warframe.market/v1/items/${itemName}`);
    return response.data;
}

// Get item orders by name
async function getItemOrdersByName(itemName) {
    try {
        const response = await axios.get(`https://api.warframe.market/v1/items/${itemName}/orders`);
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response && error.response.status === 404) {
                console.error('Mod not found:', error.response.data);
                return 404;
            } else {
                if (error.response) {
                    console.error('HTTP Error:', error.response.status, error.response.data);
                } else if (errpr.request) {
                    console.error('No response recieved');
                } else {
                    console.error('Request setup error:', error.message);
                }
            }
            return -1; // Some other random error
        }
    }
}

    // Export functions
    module.exports = {
        getAllItems,
        getItemByName,
        getItemOrdersByName
    }