import 'reflect-metadata';
import Mali from 'mali';
import { resolve } from 'path';
import { createConnection } from 'typeorm';
import { registerUser } from './user/user.controller';

const PROTO_PATH = resolve(__dirname, './proto/user.proto');

export const bootstrap = async () => {
    try {
        await createConnection();
        const app = await new Mali(PROTO_PATH, 'UserService');
        app.use({ registerUser });
        await app.start('127.0.0.1:9009');
    } catch (e) {
        console.error(e);
    }
};

bootstrap();
