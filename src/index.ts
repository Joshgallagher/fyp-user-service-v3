import Mali from 'mali';
import { resolve } from 'path';

const PROTO_PATH = resolve(__dirname, './proto/user.proto');
const PROTO_SERVICE = 'UserService';

const app = new Mali(PROTO_PATH, PROTO_SERVICE);
app.start('127.0.0.1:9009');
