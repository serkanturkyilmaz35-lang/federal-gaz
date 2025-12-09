import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; // Needed for dialect

// Optimization: Prevent DNS lookup delay for localhost by forcing 127.0.0.1
// If DB_HOST is missing or 'localhost', use '127.0.0.1' to avoid IPv6 timeout (5s delay)
const getHost = (host?: string) => {
  if (!host || host === 'localhost') return '127.0.0.1';
  return host;
};

const dbConfig = {
  host: getHost(process.env.DB_HOST),
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'federal_gaz',
};

// Singleton pattern for Sequelize instance with Global caching for HMR
/* eslint-disable no-var */
declare global {
  var sequelizeGlobal: Sequelize | undefined;
}
/* eslint-enable no-var */

let sequelize: Sequelize | null = global.sequelizeGlobal || null;

// Debug logging to verify env vars are loaded (masking password)
console.log('🔌 Initializing Database Connection...');
console.log(`Debug Config: Host=${dbConfig.host ? 'Set' : 'Missing'}, User=${dbConfig.user}, DB=${dbConfig.database}, Port=${dbConfig.port}, SSL=False`);

export const getDb = (): Sequelize => {
  if (!process.env.DB_HOST) {
    console.error('❌ FATAL: DB_HOST is missing in environment variables! Falling back to SQLite Memory (Data will be lost).');
    if (!sequelize) {
      sequelize = new Sequelize('sqlite::memory:', { logging: false });
      global.sequelizeGlobal = sequelize;
    }
    return sequelize!;
  }

  const isLocal = dbConfig.host === '127.0.0.1' || dbConfig.host === 'localhost';

  if (!sequelize) {
    try {
      sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        dialectOptions: isLocal ? {} : {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        dialectModule: mysql2,
        logging: false,
        pool: {
          max: 3,  // Reduced for serverless - prevents "Too many connections"
          min: 0,  // Allow pool to completely close in serverless
          acquire: 30000,
          idle: 10000,  // Close idle connections after 10 seconds
          evict: 10000  // Check for idle connections every 10 seconds
        }
      });
      console.log('✅ Sequelize instance created with MySQL config.');
      global.sequelizeGlobal = sequelize;
    } catch (err) {
      console.error('❌ Error creating Sequelize instance:', err);
      throw err;
    }
  }
  return sequelize;
};

export const connectToDatabase = async () => {
  const db = getDb();
  if (db) {
    try {
      // Optimization: Skip explicit authenticate() check on every request for speed.
      // The connection pool handles keep-alive. First query will fail if disconnected.
      // await db.authenticate(); 

      // console.log('✅ Database connection established successfully.');
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }
  return db;
};
