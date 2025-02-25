import sql from "mssql";
import { config } from 'dotenv';

config(); // dotenv config

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: 1433,
    database: process.env.DB_NAME,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // Use encryption (set false if using local SQL Server without SSL)
        trustServerCertificate: true, // Required for self-signed certificates
        connectionTimeout: 30000, // 30 seconds
        requestTimeout: 30000, // 30 seconds
    },
};

// Create a connection pool
const connectToDb = async () => {
    try {
        const pool = sql.connect(dbConfig);
        console.log("Connected to MSSQL server");
        return pool
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
};

// Helper function to execute a raw SQL query
const executeQuery = async (query, params = []) => {
    let pool;
    try {
        pool = await connectToDb(); // Ensure connection reuse
        const request = pool.request();

        params.forEach((param, index) => {
            request.input(`param${index}`, param);
        });

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    } finally {
        if (pool) await pool.close(); // Close connection to prevent leaks
    }
};

connectToDb();

// Helper function to execute a stored procedure
const executeStoredProcedure = async (procedureName, params = []) => {
    try {
        const request = new sql.Request();

        // Bind parameters if provided
        params.forEach(({ name, type, value }) => {
            request.input(name, type, value);
        });

        const result = await request.execute(procedureName);
        return result.recordset;
    } catch (error) {
        console.error("Error executing stored procedure:", error);
        throw error;
    }
};

const closeConnection = async () => {
    try {
        await sql.close();
        console.log("Connection closed.");
    } catch (error) {
        console.error("Error closing connection:", error);
    }
};

export { connectToDb, executeQuery, executeStoredProcedure, closeConnection };
