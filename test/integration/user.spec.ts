import Mali from 'mali';
import caller from 'grpc-caller';
import { resolve } from 'path';
import { bootstrap } from '../../src';
import { User } from '../../src/user/user.entity';

const PROTO_PATH = resolve(__dirname, '../../src/proto/user.proto');

let server: Mali;
let rpcCaller: any;

beforeEach(async () => {
    server = await bootstrap();

    rpcCaller = await caller('127.0.0.1:50052', PROTO_PATH, 'UserService');
});

afterEach(async () => await server.close());

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
