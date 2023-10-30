const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
let sessionLogStream = null;

function createSessionLog() {
    // Create a logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    // Generate a unique session ID based on the current timestamp
    const sessionID = new Date().toISOString().replace(/[^0-9]+/g, '');

    // Create a log file for the current session
    const sessionLogFileName = `session_${sessionID}.log`;
    const sessionLogFilePath = path.join(logsDir, sessionLogFileName);

    // Open a write stream to the session log file
    sessionLogStream = fs.createWriteStream(sessionLogFilePath, { flags: 'a' });
}

function log(message) {
    if (!sessionLogStream) {
        // If session log stream doesn't exist, create a new session log
        createSessionLog();
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    const logMessage = `[${formattedDate}] ${message}\n`;

    console.log(logMessage);

    // Write the log message to the session log file
    sessionLogStream.write(logMessage, (err) => {
        if (err) {
            console.error('Error writing to the session log file:', err);
        }
    });
}

function closeSessionLog() {
    if (sessionLogStream) {
        // Close the session log stream if it exists
        sessionLogStream.end();
        sessionLogStream = null;
    }
}

// @TODO: Add override function to take in Objects for error handling/logging

// Call closeSessionLog when the system shuts down or when the session ends.
process.on('exit', closeSessionLog);

module.exports = { log };
