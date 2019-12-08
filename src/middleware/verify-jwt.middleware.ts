import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWKS, JWT } from 'jose';
import { get } from 'request-promise-native';

export const verifyJwtMiddleware = (): Function => {
    return bearer(
        async (token: string, _context: Context, next: any): Promise<void> => {
            const body = await get(`${process.env.OATHKEEPER_API_URL}/.well-known/jwks.json`);

            const ks = JWKS.asKeyStore(JSON.parse(body));

            JWT.verify(token, ks, {});

            await next();
        },
    );
};
