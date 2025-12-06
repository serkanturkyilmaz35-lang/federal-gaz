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

export const getDb = (): Sequelize => {
  if (!process.env.DB_HOST) {
    console.warn('⚠️ Database credentials not found. DB features will be disabled.');
    // Return a dummy object or null here, but models expect a sequelize instance.
    // We will initialize a dummy SQLite memory instance to prevent crashes if credentials are missing
    if (!sequelize) {
      const { Sequelize } = require('sequelize');
      sequelize = new Sequelize('sqlite::memory:', { logging: false });
    }
    return sequelize!;
  }

  if (!sequelize) {
    sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'mysql',
      dialectModule: mysql2, // Explicitly provide mysql2
      logging: false, // Set to console.log to see SQL queries
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false, // Required for some Aiven setups if CA not provided
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 5000,
        idle: 10000
      }
    });
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
