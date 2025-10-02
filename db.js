import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'sathvikalladi',
    host: 'localhost',
    database: 'football_gridiron',
    password: '',
    port: 5432,
});

export default pool;