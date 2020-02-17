import './config.core';
import Mali from 'mali';
import { resolve } from 'path';
import { registerUser, authenticateUser, getUser } from '../user/user.controller';
import { createConnection } from './connection.core';
import { validateMiddleware } from '../middleware/validate.middleware';
import { verifyJwtMiddleware } from '../middleware/verify-jwt.middleware';

const PROTO_PATH = resolve(__dirname, '../proto/user.proto');
const PROTO_SERVICE = 'UserService';

let appInstance: Mali;

export const startServer = async (randomPort = false): Promise<Mali> => {
    await createConnection();

    appInstance = new Mali(PROTO_PATH, PROTO_SERVICE);

    appInstance.use(validateMiddleware());
    appInstance.use({
        UserService: {
            registerUser: [registerUser],
            authenticateUser: [authenticateUser],
            getUser: [getUser, verifyJwtMiddleware],
        },
    });

    if (randomPort) {
        appInstance.start(`${process.env.HOST}:0`);

        return appInstance;
    }

    appInstance.start(`${process.env.HOST}:${process.env.PORT}`);

    return appInstance;
};

export const shutdownServer = async (): Promise<void> => {
    await appInstance.close();

    process.exit();
};
