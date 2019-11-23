import dotenv from 'dotenv';
import { resolve } from 'path';

let path: string;

switch (process.env.NODE_ENV) {
    case 'test':
        path = resolve(__dirname, '../../.env.test');
        break;

    default:
        path = resolve(__dirname, '../../.env');
        break;
}

dotenv.config({ path });
