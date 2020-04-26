import { startServer } from '../../src/core/server.core';
import { User } from '../../src/user/user.entity';
import { rpcClient } from '../helper/rpc-client.helper';
import { status as rpcStatus, Metadata } from 'grpc';
import faker from 'faker';

describe('A user can be registered, authenticated and thier details can be retrieved', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer(true);
        rpcCaller = await rpcClient(rpcServer.ports[0]);
    });

    afterEach(async () => await User.clear());
    afterAll(async () => await rpcServer.close());

    describe('A user can register with a name, email and password', () => {
        test('Successful registration', async () => {
            expect.assertions(3);

            const user = {
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8),
            };

            const rpcResponse = await rpcCaller.registerUser(user);

            expect(rpcResponse).toHaveProperty('registered');
            expect(rpcResponse).toMatchObject({ registered: true });

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
                expect(responseMetadata.get('error')).toContain(
                    'password must be longer than or equal to 6 characters',
                );
            }
        });
    });

    describe('A user can authenticate with their email and password', () => {
        test('Successful authentication', async () => {
            expect.assertions(4);

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

            const authenticateUser = await User.find({ where: { email: user.email } });

            expect(rpcResponse).toHaveProperty('id');
            expect(rpcResponse).toHaveProperty('name');
            expect(rpcResponse).toMatchObject({ id: authenticateUser[0].id });
            expect(rpcResponse).toMatchObject({ name: user.name });
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
                expect(responseMetadata.get('error')).toContain(
                    'password must be longer than or equal to 6 characters',
                );
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

    describe('A users details can be found by their ID', () => {
        test('A user can be found successfully by their ID', async () => {
            expect.assertions(4);

            const { id, name } = await User.create({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8),
            }).save();

            const rpcResponse = await rpcCaller.getUser({ id });

            expect(rpcResponse).toHaveProperty('id');
            expect(rpcResponse).toHaveProperty('name');
            expect(rpcResponse).toMatchObject({ id });
            expect(rpcResponse).toMatchObject({ name });
        });
    });
});
