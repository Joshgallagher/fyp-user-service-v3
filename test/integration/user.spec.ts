import caller from 'grpc-caller';
import { resolve } from 'path';
import { User } from '../../src/user/user.entity';
import { server } from '../../src/core/server.core';
import { connection } from '../../src/core/connection.core';

const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');

let rpcServer: any;
let rpcCaller: any;

beforeEach(async () => {
    await connection();
    rpcServer = server();
    rpcCaller = await caller('127.0.0.1:50052', PROTO_PATH, 'UserService');
});

afterEach(async () => await rpcServer.close());

describe('A user can register', () => {
    test('Successful registration', async () => {
        const rpcResponse = await rpcCaller.registerUser({
            name: 'test',
            email: 'test@test.com',
            password: 'secret',
        });

        expect(rpcResponse).toHaveProperty('id');
        expect(rpcResponse).toHaveProperty('name');
        expect(rpcResponse).toMatchObject({ name: 'test' });

        const newUser = await User.find({ where: { email: 'test@test.com' } });

        expect(newUser).toHaveLength(1);
    });
});
