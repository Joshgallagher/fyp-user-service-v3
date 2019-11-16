import { Context } from 'mali';
import { getRepository } from 'typeorm';
import { User } from './user.entity';

export const createUser = async (context: Context): Promise<void> => {
    const { name, email, password } = context.request.req;

    const { id } = await getRepository<User>(User).save({ name, email, password });

    context.res = { id, name };
};
