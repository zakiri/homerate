import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const LoggerService = {
  log: (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  info: (message) => LoggerService.log(message, 'INFO'),
  
  error: (message, error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    LoggerService.log(`${message}: ${errorMessage}`, 'ERROR');
  },
  
  warn: (message) => LoggerService.log(message, 'WARN'),
  
  debug: (message) => LoggerService.log(message, 'DEBUG')
};
