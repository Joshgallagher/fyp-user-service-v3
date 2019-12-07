import 'reflect-metadata';
import { startServer, shutdownServer } from './core/server.core';

(async () => await startServer())();

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
