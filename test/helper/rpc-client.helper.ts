import caller from 'grpc-caller';
import { resolve } from 'path';

const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');
const PROTO_SERVICE = 'UserService';

export const rpcClient = async (host = '127.0.0.1', port = '50051') => {
    return await caller(`${host}:${port}`, PROTO_PATH, PROTO_SERVICE);
};
