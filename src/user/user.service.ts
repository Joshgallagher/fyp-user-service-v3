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

    return await User.create({ name, email, password }).save();
};

export const authenticate = async (data: Record<string, string>): Promise<boolean> => {
    const { email, password } = data;

    const user: any = await getRepository(User).findOne({ where: { email } });

    if (!user || !(await compare(password, user.password))) {
        throw new RpcException('UNAUTHENTICATED_ERROR', status.UNAUTHENTICATED, {
            error: 'The provided email or password are incorrect',
        });
    }

    return true;
};

export const get = async (data: Record<string, string>): Promise<User> => {
    const { id } = data;

    const user: any = await getRepository(User).findOne(id);

    if (!user) {
        throw new RpcException('NOT_FOUND_ERROR', status.NOT_FOUND, {
            error: 'User not found',
        });
    }

    return user;
};
