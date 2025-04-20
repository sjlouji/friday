import winston from 'winston';

interface LoggerOptions {
    service: string;
    logPath?: string;
}

export class Logger {
    private logger: winston.Logger;
    private service: string;

    constructor({ service, logPath = 'logs' }: LoggerOptions) {
        this.service = service;
        this.logger = this.createLogger(logPath);
    }

    private createLogger(logPath: string): winston.Logger {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 4,
        };

        const colors = {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            http: 'magenta',
            debug: 'white',
        };

        const format = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(
                (info) => `[${this.service}] ${info.timestamp} ${info.level}: ${info.message}`
            )
        );

        const transports = [
            new winston.transports.Console(),
            new winston.transports.File({ 
                filename: `${logPath}/${this.service}.log` 
            }),
        ];

        winston.addColors(colors);

        return winston.createLogger({
            level: 'info',
            levels,
            format,
            transports,
        });
    }

    public info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    public error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    public http(message: string, meta?: any): void {
        this.logger.http(message, meta);
    }
}
