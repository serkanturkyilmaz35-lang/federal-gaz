

const { Sequelize, DataTypes, Op } = require('sequelize');
const mysql2 = require('mysql2');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Helper to force IPv4
const getHost = (host) => {
    if (!host || host === 'localhost') return '127.0.0.1';
    return host;
};

async function benchmark() {
    console.log('Starting benchmark...');
    const t0 = Date.now();

    const dbConfig = {
        host: getHost(process.env.DB_HOST),
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'federal_gaz',
    };

    console.log(`Connecting to ${dbConfig.host}:${dbConfig.port}...`);

    // Setup simpler connection for script
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: false,
    });

    try {
        // await sequelize.authenticate(); // SKIPPING AUTHENTICATE TO TEST LAZY CONNECT
        // console.log(`DB Connected in ${Date.now() - t0}ms`);

        const filterStart = new Date();
        filterStart.setDate(filterStart.getDate() - 30);
        const filterEnd = new Date();

        const qStart = Date.now();
        console.log('Running First Query (Lazy Connect)...');

        // Emulate the optimized query
        const orderResults = await sequelize.query(`
            SELECT DATE(createdAt) as date, COUNT(id) as count 
            FROM orders 
            WHERE createdAt BETWEEN :start AND :end 
            GROUP BY DATE(createdAt) 
            ORDER BY DATE(createdAt) ASC
        `, {
            replacements: { start: filterStart, end: filterEnd },
            type: Sequelize.QueryTypes.SELECT
        });

        const qEnd = Date.now();
        console.log(`First Query Total Time (Connect + Query): ${qEnd - qStart}ms`);
        console.log(`Rows returned: ${orderResults.length}`);

        const cStart = Date.now();
        const contactResults = await sequelize.query(`
            SELECT DATE(createdAt) as date, COUNT(id) as count 
            FROM contact_requests 
            WHERE createdAt BETWEEN :start AND :end 
            GROUP BY DATE(createdAt) 
            ORDER BY DATE(createdAt) ASC
        `, {
            replacements: { start: filterStart, end: filterEnd },
            type: Sequelize.QueryTypes.SELECT
        });

        console.log(`Optimized Contacts Query Time: ${Date.now() - cStart}ms`);

        console.log('Benchmark Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

benchmark();
