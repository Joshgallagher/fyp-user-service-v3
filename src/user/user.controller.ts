import { Context } from 'mali';
import { register, authenticate, get, getByIds } from './user.service';

export const registerUser = async (context: Context): Promise<void> => {
    const registered = await register(context.request.req);

    context.res = { registered };
};

export const authenticateUser = async (context: Context): Promise<void> => {
    const { id, name } = await authenticate(context.request.req);

    context.res = { id, name };
};

export const getUser = async (context: Context): Promise<void> => {
    const { id, name } = await get(context.request.req);

    context.res = { id, name };
};

export const getUsersByIds = async (context: Context): Promise<void> => {
    const users = await getByIds(context.request.req.ids);

    context.res = { users };
};
