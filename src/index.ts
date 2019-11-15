import Mali from 'mali';
import { resolve } from 'path';
import { createConnection } from 'typeorm';

const PROTO_PATH = resolve(__dirname, './proto/user.proto');

async function bootstrap() {
    const app = await new Mali(PROTO_PATH, 'UserService');

    await createConnection()
        .then(async () => {
            await app.start('127.0.0.1:9009');
        })
        .catch(error => console.error(error));
}

bootstrap();
