import 'reflect-metadata';
import { startServer } from './core/server.core';

(async () => await startServer('127.0.0.1', '50052'))();
