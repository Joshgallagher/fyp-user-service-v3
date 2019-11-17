import caller from 'grpc-caller';
import { resolve } from 'path';
import { bootstrap } from '../../src';

let rpcCaller: any;
const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');

beforeEach(async () => {
    await bootstrap();

    rpcCaller = await caller('127.0.0.1:9009', PROTO_PATH, 'UserService');
});

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
    });
});
