import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWKS, JWT, errors } from 'jose';
import { get } from 'request-promise-native';
import RpcException from 'grpc-error';
import { status } from 'grpc';

export const verifyJwtMiddleware = (): Function => {
    return bearer(
        async (token: string, _context: Context, next: any): Promise<void> => {
            let jwks: any;

            try {
                jwks = await get(`${process.env.OATHKEEPER_API_URL}/.well-known/jwks.json`);
            } catch (e) {
                throw new RpcException('INTERNAL_ERROR', status.INTERNAL, {
                    error: 'Something went wrong when requesting the JWKS from Oathkeeper API',
                });
            }

            try {
                const ks = JWKS.asKeyStore(JSON.parse(jwks));
                JWT.verify(token, ks, {});
            } catch (e) {
                const code = e.code.substring(4);
                const clientError =
                    (e as any) instanceof
                    (errors.JWTMalformed ||
                        errors.JWTClaimInvalid ||
                        errors.JWSVerificationFailed ||
                        errors.JWSInvalid);

                if (clientError) {
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
