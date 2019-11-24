import { startServer } from '../../../src/core/server.core';
import { User } from '../../../src/user/user.entity';
import { rpcClient } from '../../helper/rpc-client.helper';
import { status as rpcStatus, Metadata } from 'grpc';
import faker from 'faker';

describe('A users details can be found by their ID', () => {
    let rpcServer: any;
    let rpcCaller: any;

    beforeAll(async () => {
        rpcServer = await startServer(true);
        rpcCaller = await rpcClient(rpcServer.ports[0]);
    });

    afterEach(async () => await User.clear());
    afterAll(async () => await rpcServer.close());

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

    test('User can not be found due to a malformed ID (UUID)', async () => {
        expect.assertions(4);

        await User.create({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
        }).save();

        const malformedUuid = 'd9e56f60-74e8-4f9b--3a55545f2332';

        try {
            await new rpcCaller.Request('getUser', {
                id: malformedUuid,
            })
                .withResponseMetadata(true)
                .withResponseStatus(true)
                .exec();
        } catch ({ code, details, metadata }) {
            const responseMetadata = metadata as Metadata;

            expect(code).toEqual(rpcStatus.FAILED_PRECONDITION);

            expect(details).toEqual('VALIDATION_ERROR');

            expect(responseMetadata.get('field')).toContain('id');
            expect(responseMetadata.get('error')).toContain('id must be an UUID');
        }
    });
});
