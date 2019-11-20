import { createConnection as connect, getConnectionOptions } from 'typeorm';

export const createConnection = async (): Promise<void> => {
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

    await connect({ ...connectionOptions, name: 'default' });
};
