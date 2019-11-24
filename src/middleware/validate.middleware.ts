import { Context } from 'mali';
import { validateOrReject } from 'class-validator';
import RpcException from 'grpc-error';
import { status } from 'grpc';
import { User } from '../user/user.entity';

export const validateMiddleware = (): Function => {
    return async function validate(context: Context, next: Function): Promise<void> {
        const user = User.create(context.request.req);

        try {
            await validateOrReject(user, { skipMissingProperties: true });
        } catch ([{ property, constraints }]) {
            throw new RpcException('VALIDATION_ERROR', status.FAILED_PRECONDITION, {
                field: property,
                error: constraints[Object.keys(constraints)[0]],
            });
        }

        await next();
    };
};
