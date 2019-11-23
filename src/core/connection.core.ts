import { createConnection as connect, getConnectionOptions } from 'typeorm';

export const createConnection = async (): Promise<void> => {
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

    await connect({
        ...connectionOptions,
        name: 'default',
        entities: ['src/**/*.entity.ts'],
        migrations: ['src/database/migration/**/*.ts'],
        subscribers: ['src/**/*.subscriber.ts'],
    });
};
