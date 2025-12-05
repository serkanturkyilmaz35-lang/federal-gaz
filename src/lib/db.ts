// Database configuration for MySQL
// This file provides a simple connection setup for the application

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'federal_gaz',
};

// TODO: Implement proper database connection with mysql2 or better-sqlite3
// For now, this is just a placeholder configuration

export default dbConfig;
