import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config';
import routes from '@/routes';
import { connectDB } from './utils/database';
import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';

class AuthServer {
  private app: Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupProcessHandlers();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true
    }));
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.use('/api', routes);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupProcessHandlers(): void {
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', err);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      await connectDB();
      
      this.app.listen(this.port, () => {
        logger.info(`Server running in ${config.nodeEnv} mode on port ${this.port}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new AuthServer();
server.start();