import { Request, Response } from 'express';
import os from 'os';

export class HealthController {
    public static getHealth(_req: Request, res: Response) {
        res.status(200).json({
            status: 'alive',
            message: 'Auth service is running',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    }

    public static getlifeLine(_req: Request, res: Response) {
        res.status(200).json({
            status: 'ok',
            system: {
                arch: os.arch(),
                platform: os.platform(),
                cpus: os.cpus().length,
                memory: {
                    total: os.totalmem(),
                    free: os.freemem()
                },
                uptime: os.uptime()
            },
            process: {
                version: process.version,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            },
            timestamp: new Date().toISOString()
        });
    }
}
