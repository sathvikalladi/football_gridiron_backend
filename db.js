import pg from 'pg';

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'football_gridiron',
    password: 'password1',
    port: 5432,
});

export default db;