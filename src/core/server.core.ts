import './config.core';
import Mali from 'mali';
import { resolve } from 'path';
import { registerUser, authenticateUser, getUser } from '../user/user.controller';
import { createConnection } from './connection.core';

const PROTO_PATH = resolve(__dirname, '../proto/user.proto');
const PROTO_SERVICE = 'UserService';

export const startServer = async (randomPort = false): Promise<Mali> => {
    await createConnection();

    const app = new Mali(PROTO_PATH, PROTO_SERVICE);

    app.use({ registerUser, authenticateUser, getUser });

    if (randomPort) {
        app.start(`${process.env.HOST}:0`);
    } else {
        app.start(`${process.env.HOST}:${process.env.PORT}`);
    }

    return app;
};
