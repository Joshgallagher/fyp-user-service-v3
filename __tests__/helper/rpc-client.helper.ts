import caller from 'grpc-caller';
import { resolve } from 'path';

const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');
const PROTO_SERVICE = 'UserService';

export const rpcClient = async (serverPort: number) => {
    return await caller(`${process.env.HOST}:${serverPort}`, PROTO_PATH, PROTO_SERVICE);
};
