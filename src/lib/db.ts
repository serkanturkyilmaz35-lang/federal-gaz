import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2'; // Needed for dialect

const dbConfig = {
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'federal_gaz',
};

// Singleton pattern for Sequelize instance
let sequelize: Sequelize | null = null;

// Debug logging to verify env vars are loaded (masking password)
console.log('🔌 Initializing Database Connection...');
console.log(`Debug Config: Host=${process.env.DB_HOST ? 'Set' : 'Missing'}, User=${process.env.DB_USER}, DB=${process.env.DB_NAME}, Port=${process.env.DB_PORT}, SSL=True`);

export const getDb = (): Sequelize => {
  if (!process.env.DB_HOST) {
    console.error('❌ FATAL: DB_HOST is missing in environment variables! Falling back to SQLite Memory (Data will be lost).');
    if (!sequelize) {
      sequelize = new Sequelize('sqlite::memory:', { logging: console.log });
    }
    return sequelize!;
  }

  if (!sequelize) {
    try {
      sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'mysql',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        dialectModule: mysql2,
        logging: (msg) => console.log(`[Sequelize]: ${msg}`), // Log queries to see if they fail
        pool: {
          max: 5,
          min: 0,
          acquire: 30000, // Increased timeout
          idle: 10000
        }
      });
      console.log('✅ Sequelize instance created with MySQL config.');
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
      await db.authenticate();
      console.log('✅ Database connection established successfully.');
      // Note: sync removed for faster login - run migrations separately if needed
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }
  return db;
};
