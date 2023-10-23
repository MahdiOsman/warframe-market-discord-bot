// Warframe Market API
const axios = require('axios');

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
    const response = await axios.get(`https://api.warframe.market/v1/items/${itemName}/orders`);
    return response.data;
}

// Export functions
module.exports = {
    getAllItems,
    getItemByName,
    getItemOrdersByName
}