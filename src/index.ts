import 'reflect-metadata';
import Mali from 'mali';
import { resolve } from 'path';
import { createConnection, getConnectionOptions } from 'typeorm';
import { registerUser } from './user/user.controller';

const PROTO_PATH = resolve(__dirname, './proto/user.proto');

export const bootstrap = async () => {
    let app: any;

    try {
        const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
        await createConnection({ ...connectionOptions, name: 'default' });

        app = await new Mali(PROTO_PATH, 'UserService');
        app.use({ registerUser });
        await app.start('127.0.0.1:50052');
    } catch (e) {
        console.error('[HERE]' + e);
    }

    return app;
};

bootstrap();
