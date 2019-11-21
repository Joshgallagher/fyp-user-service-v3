import { startServer } from '../../src/core/server.core';
import { User } from '../../src/user/user.entity';
import { rpcClient } from '../helper/rpc-client.helper';
import { status as rpcStatus, Metadata } from 'grpc';

describe('A user can register', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer();
        rpcCaller = await rpcClient();
    });

    afterEach(async () => await User.clear());
    afterAll(async () => await rpcServer.close());

    test('Successful registration', async () => {
        expect.assertions(4);

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

    test('Unsuccessful registration due to unavailable email', async () => {
        expect.assertions(4);

        const email = 'test@test.com';

        await User.create({ name: 'test', email, password: 'secret' }).save();

        try {
            await new rpcCaller.Request('registerUser', {
                name: 'test',
                email,
                password: 'secret',
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.FAILED_PRECONDITION);

            expect(details).toEqual('VALIDATION_ERROR');

            expect(responseMetadata.get('field')).toContain('email');
            expect(responseMetadata.get('error')).toContain('Email is already in use');
        }
    });
});
