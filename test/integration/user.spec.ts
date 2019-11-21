import { startServer } from '../../src/core/server.core';
import { User } from '../../src/user/user.entity';
import { rpcClient } from '../helper/rpc-client.helper';
import { status as rpcStatus, Metadata } from 'grpc';
import faker from 'faker';

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

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        const rpcResponse = await rpcCaller.registerUser(user);

        expect(rpcResponse).toHaveProperty('id');
        expect(rpcResponse).toHaveProperty('name');
        expect(rpcResponse).toMatchObject({ name: user.name });

        const newUser = await User.find({ where: { email: user.email } });

        expect(newUser).toHaveLength(1);
    });

    test('Unsuccessful registration due to unavailable email', async () => {
        expect.assertions(4);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        await User.create(user).save();

        try {
            await new rpcCaller.Request('registerUser', user)
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

    test('Unsuccessful registration due to name not being provided', async () => {
        expect.assertions(4);

        const user = {
            name: '',
            email: faker.internet.email(),
            password: faker.internet.password(8),
        };

        try {
            await new rpcCaller.Request('registerUser', user)
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.FAILED_PRECONDITION);

            expect(details).toEqual('VALIDATION_ERROR');

            expect(responseMetadata.get('field')).toContain('name');
            expect(responseMetadata.get('error')).toContain('name should not be empty');
        }
    });

    test('Unsuccessful registration due to malformed email', async () => {
        expect.assertions(4);

        const user = {
            name: faker.name.firstName(),
            email: 'malformed@gmailcom',
            password: faker.internet.password(8),
        };

        try {
            await new rpcCaller.Request('registerUser', user)
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

    test('Unsuccessful registration due to password being less than 6 characters', async () => {
        expect.assertions(4);

        const user = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: '',
        };

        try {
            await new rpcCaller.Request('registerUser', user)
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
});
