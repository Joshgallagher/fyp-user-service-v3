import { Context } from 'mali';
import { register, authenticate, get } from './user.service';

export const registerUser = async (context: Context): Promise<void> => {
    const registered = await register(context.request.req);

    context.res = { registered };
};

export const authenticateUser = async (context: Context): Promise<void> => {
    const authenticated = await authenticate(context.request.req);

    context.res = { authenticated };
};

export const getUser = async (context: Context): Promise<void> => {
    const { id, name } = await get(context.request.req);

    context.res = { id, name };
};
