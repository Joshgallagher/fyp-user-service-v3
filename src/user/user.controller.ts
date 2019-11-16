import { Context } from 'mali';
import { validateOrReject } from 'class-validator';
import { getRepository } from 'typeorm';
import RpcException from 'grpc-error';
import { status } from 'grpc';
import { User } from './user.entity';

export const createUser = async (context: Context): Promise<void> => {
    const { name, email, password } = context.request.req;

    if (!!(await getRepository(User).findOne({ where: { email } }))) {
        throw new RpcException('VALIDATION_ERROR', status.FAILED_PRECONDITION, {
            field: 'email',
            error: 'Email is already in use',
        });
    }

    const newUser = User.create({ name, email, password });

    try {
        await validateOrReject(newUser);
    } catch ([{ property, constraints }]) {
        throw new RpcException('VALIDATION_ERROR', status.FAILED_PRECONDITION, {
            field: property,
            error: constraints[Object.keys(constraints)[0]],
        });
    }

    const { id } = await newUser.save();

    context.res = { id, name };
};
