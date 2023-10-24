const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, 'logs');

function createLog() {
    // Create a logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
}

function log(message) {
    // Create a logs directory if it doesn't exist
    createLog();

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Format the date as a string

    const logFileName = `${formattedDate.replace(/[^0-9]+/g, '')}.log`; // Remove non-numeric characters from the date
    const logFilePath = path.join(logsDir, logFileName);

    const logMessage = `[${formattedDate}] ${message}\n`;

    console.log(logMessage);

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to the log file:', err);
        }
    });
};

// @TODO: Add override function to take in Objects for error handling/logging

module.exports = { log };
