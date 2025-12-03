import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'federal_gaz_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false, // Set to console.log to see SQL queries
  }
);

export default sequelize;
