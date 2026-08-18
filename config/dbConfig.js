const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || 1433),
    options: {
        encrypt: false, // Set to false for local dev, true for Azure
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    }
};

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log('Connected to MSSQL Database successfully.');
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed!', err);
        // Depending on your requirements, you might want to process.exit(1) here
    }
};

const getPool = () => pool;

module.exports = { connectDB, getPool, sql };
