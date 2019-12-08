// import { Context } from 'mali';
import bearer from '@malijs/bearer';
import { JWKS, JWT } from 'jose';

export const verifyJwtMiddleware = (): Function => {
    return bearer(
        async (token: string, context: any, next: Function): Promise<void> => {
            const testKey: any = {
                keys: [
                    {
                        use: 'sig',
                        kty: 'RSA',
                        kid: '99ce63c2-b47a-4b40-ae53-ac02940e8e53',
                        alg: 'RS256',
                        n:
                            'wOPf2xfG6dpYkCmj9ZzSmoYBIeHQTskTf_z0Mv6gOKJPdfF3RQns0ZJuvJzfYPtS5QQtz1LDnA7V6h7WP9HV2bHcR1C1dCG8etIpmpNj3QqfjN09or4FyecXhhwThbd77aNm56lAW7bmwGLkEd-sX5SzlitLvQSDLFFQo4EAx44WuT4Jl6dLTiT4HYR-jVBRTzSBju1HDjaYEHjRgRDLnzLzsKp0AA4cJ3NzIcyWSZgWNpLp3iFvFudMA4L1EfzWujCRo8QkFv3lwCsk6qjuHEDPlulp-LgcACDurYm1lhiyOgLt9HgTBDvyNEHgoP6yheJD3Ljl66rylQJlJfE_Sw',
                        e: 'AQAB',
                    },
                ],
            };

            context.ks = JWKS.asKeyStore(testKey);

            JWT.verify(token, context.ks, {});

            await next();
        },
    );
};
