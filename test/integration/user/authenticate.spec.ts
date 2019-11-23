import { startServer } from '../../../src/core/server.core';
import { User } from '../../../src/user/user.entity';
import { rpcClient } from '../../helper/rpc-client.helper';
import { status as rpcStatus, Metadata } from 'grpc';
import faker from 'faker';

describe('A user can authenticate with their email and password', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer(true);
        rpcCaller = await rpcClient(rpcServer.ports[0]);
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

    test('Unsuccessful authentication due to email not being provided', async () => {
        expect.assertions(4);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        try {
            await new rpcCaller.Request('authenticateUser', {
                email: '',
                password: user.password,
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.FAILED_PRECONDITION);

            expect(details).toEqual('VALIDATION_ERROR');

            expect(responseMetadata.get('field')).toContain('email');
            expect(responseMetadata.get('error')).toContain('email must be an email');
        }
    });

    test('Unsuccessful authentication due to password not being provided', async () => {
        expect.assertions(4);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        try {
            await new rpcCaller.Request('authenticateUser', {
                email: user.email,
                password: '',
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.FAILED_PRECONDITION);

            expect(details).toEqual('VALIDATION_ERROR');

            expect(responseMetadata.get('field')).toContain('password');
            expect(responseMetadata.get('error')).toContain('password must be longer than or equal to 6 characters');
        }
    });

    test('Unsuccessful authentication due to incorrect user credentials (email)', async () => {
        expect.assertions(3);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        try {
            await new rpcCaller.Request('authenticateUser', {
                email: 'incorrectemail@test.com',
                password: user.password,
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.UNAUTHENTICATED);

            expect(details).toEqual('UNAUTHENTICATED_ERROR');

            expect(responseMetadata.get('error')).toContain('The provided email or password are incorrect');
        }
    });

    test('Unsuccessful authentication due to incorrect user credentials (password)', async () => {
        expect.assertions(3);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        try {
            await new rpcCaller.Request('authenticateUser', {
                email: user.email,
                password: 'wrongPassword123',
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.UNAUTHENTICATED);

            expect(details).toEqual('UNAUTHENTICATED_ERROR');

            expect(responseMetadata.get('error')).toContain('The provided email or password are incorrect');
        }
    });
});
