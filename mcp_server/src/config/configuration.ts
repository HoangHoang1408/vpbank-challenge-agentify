const configuration = () => ({
    app: {
        port: parseInt(process.env.APP_PORT || '3000', 10),
    },
    postgres: {
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
        username: process.env.POSTGRES_USERNAME ?? 'postgres',
        password: process.env.POSTGRES_PASSWORD ?? 'postgres',
        database: process.env.POSTGRES_NAME ?? 'postgres',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY ?? '',
        baseUrl: process.env.SERVICE_BASE_URL ?? 'https://api.openai.com/v1',
    },
});
export default configuration;