import caller from 'grpc-caller';
import { resolve } from 'path';

const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');
const PROTO_SERVICE = 'UserService';

export const rpcClient = async () => {
    return await caller('127.0.0.1:50052', PROTO_PATH, PROTO_SERVICE);
};
