import { validateOrReject } from 'class-validator';
import { getRepository } from 'typeorm';
import RpcException from 'grpc-error';
import { status } from 'grpc';
import { User } from './user.entity';
import { compare } from 'bcrypt';

export const register = async (data: Record<string, string>): Promise<User> => {
    const { name, email, password } = data;

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

    return await newUser.save();
};

export const authenticate = async (data: Record<string, string>): Promise<boolean> => {
    const { email, password } = data;

    const user: any = await getRepository(User).findOne({ where: { email } });

    if (!user) {
        return false;
    }

    const match: boolean = await compare(password, user.password);

    if (!match) {
        return false;
    }

    return true;
};
