import { createConnection, getConnectionOptions } from 'typeorm';

export const connection = async (): Promise<void> => {
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

    await createConnection({ ...connectionOptions, name: 'default' });
};
