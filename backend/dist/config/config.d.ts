declare const config: {
    port: number;
    couchdb: {
        url: string;
        username: string;
        password: string;
        dbName: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    env: string;
    logLevel: string;
};
export default config;
