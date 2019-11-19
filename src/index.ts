import 'reflect-metadata';
import { connection } from './core/connection.core';
import { server } from './core/server.core';

async function bootstrap() {
    await connection();
    server();
}

bootstrap();
