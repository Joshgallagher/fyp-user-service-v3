import { startServer } from '../../src/core/server.core';
import { User } from '../../src/user/user.entity';
import { rpcClient } from '../helper/rpc-client.helper';

describe('A user can register', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer();
        rpcCaller = await rpcClient();
    });

    afterAll(async () => await rpcServer.close());

    test('Successful registration', async () => {
        const email = 'test@test.com';

        const rpcResponse = await rpcCaller.registerUser({
            name: 'test',
            email,
            password: 'secret',
        });

        expect(rpcResponse).toHaveProperty('id');
        expect(rpcResponse).toHaveProperty('name');
        expect(rpcResponse).toMatchObject({ name: 'test' });

        const newUser = await User.find({ where: { email } });

        expect(newUser).toHaveLength(1);
    });
});
