import { startServer } from '../../../src/core/server.core';
import { User } from '../../../src/user/user.entity';
import { rpcClient } from '../../helper/rpc-client.helper';
import faker from 'faker';

describe('A user can authenticate with their email and password', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer();
        rpcCaller = await rpcClient();
    });

    afterEach(async () => await User.clear());
    afterAll(async () => await rpcServer.close());

    test('Successful authentication', async () => {
        expect.assertions(2);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        const rpcResponse = await rpcCaller.authenticateUser({
            email: user.email,
            password: user.password,
        });

        expect(rpcResponse).toHaveProperty('authenticated');
        expect(rpcResponse).toMatchObject({ authenticated: true });
    });
});
