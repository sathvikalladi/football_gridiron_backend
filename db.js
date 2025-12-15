import pg from 'pg';

const db = new pg.Client({
    user: 'sathvikalladi',
    host: 'localhost',
    database: 'football_gridiron',
    password: '',
    port: 5432,
});

export default db;