import { Context } from 'mali';
import { register, authenticate } from './user.service';

export const registerUser = async (context: Context): Promise<void> => {
    const { id, name } = await register(context.request.req);

    context.res = { id, name };
};

export const authenticateUser = async (context: Context): Promise<void> => {
    const authenticated = await authenticate(context.request.req);

    context.res = { authenticated };
};
