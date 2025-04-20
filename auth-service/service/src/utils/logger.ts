import winston from 'winston';
import { config } from '@/config';

const { format, createLogger, transports } = winston;

// Define the custom format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Configure the logger
export const logger = createLogger({
    level: config.logLevel,
    format: logFormat,
    defaultMeta: { service: 'auth-service' },
    transports: [
        // Write logs with level 'error' and below to error.log
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs to combined.log
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Add console transport in development
if (config.nodeEnv !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, service }) => {
                    return `${timestamp} [${service}] ${level}: ${message}`;
                })
            ),
        })
    );
}
