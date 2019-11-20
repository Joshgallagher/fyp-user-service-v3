import Mali from 'mali';
import { resolve } from 'path';
import { registerUser } from '../user/user.controller';
import { createConnection } from './connection.core';

const PROTO_PATH = resolve(__dirname, '../proto/user.proto');
const PROTO_SERVICE = 'UserService';

export const startServer = async (): Promise<Mali> => {
    await createConnection();

    const app = new Mali(PROTO_PATH, PROTO_SERVICE);

    app.use({ registerUser });
    app.start('127.0.0.1:50052');

    return app;
};
