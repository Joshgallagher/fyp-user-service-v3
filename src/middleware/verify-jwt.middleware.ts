import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWKS, JWT, errors } from 'jose';
import { get } from 'request-promise-native';
import RpcException from 'grpc-error';
import { status } from 'grpc';

export const verifyJwtMiddleware = (): Function => {
    return bearer(
        async (token: string, _context: Context, next: any): Promise<void> => {
            if (process.env.SKIP_JWT_VERIFICATION === 'true') {
                return await next();
            }

            let jwks: any;

            try {
                jwks = await get(`${process.env.JWKS_URL}/.well-known/jwks.json`, {
                    headers: { 'Content-Type': 'Application/json' },
                });
            } catch (e) {
                throw new RpcException('JWKS_ERROR', status.DEADLINE_EXCEEDED, {
                    error: 'Oathkeeper API JWKS unavailable',
                });
            }

            try {
                const keyStore = JWKS.asKeyStore(JSON.parse(jwks));

                JWT.verify(token, keyStore, {
                    profile: 'id_token',
                    audience: (process.env.JWT_AUDIENCE as string).split(','),
                    issuer: process.env.JWT_ISSUER,
                });
            } catch (e) {
                const error = e as any;
                const code = e.code.substring(4);

                if (
                    error instanceof errors.JWTClaimInvalid ||
                    error instanceof errors.JWTMalformed ||
                    error instanceof errors.JWSVerificationFailed ||
                    error instanceof errors.JWSInvalid
                ) {
                    throw new RpcException(code, status.FAILED_PRECONDITION, {
                        error: e.message,
                    });
                }

                throw new RpcException(code, status.INTERNAL, {
                    error: e.message,
                });
            }

            await next();
        },
    );
};
