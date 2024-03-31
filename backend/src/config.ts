import 'dotenv/config';

// Read config properties as needed
export const HOST = process.env.HOST || 'http://localhost';
export const PORT = process.env.PORT || '8080';

// Set default values for postgres connection. These can be modified by adding them to your .env file
function defaultConfig(key: string, defaultValue: any) {
    if (!process.env[key]) process.env[key] = defaultValue;
}
defaultConfig('PGHOST', HOST);
defaultConfig('PGPORT', 5432);
defaultConfig('PGDATABASE', 'postgres');
defaultConfig('PGUSER', 'postgres');
defaultConfig('PGPASSWORD', '');
