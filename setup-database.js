const { Pool } = require('pg');
require('dotenv').config({ path: './server/config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres', // Connect to default postgres database first
});

async function setupDatabase() {
  try {
    console.log('Setting up Relatim Chat database...');
    
    // Create database if it doesn't exist
    await pool.query('CREATE DATABASE relatim_chat');
    console.log('✅ Database "relatim_chat" created successfully');
    
    // Close the current connection
    await pool.end();
    
    // Connect to the new database
    const appPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await appPool.query(statement);
      }
    }
    
    console.log('✅ Database schema created successfully');
    console.log('✅ Database setup completed!');
    
    await appPool.end();
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log('✅ Database "relatim_chat" already exists');
      console.log('✅ Database setup completed!');
    } else {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  }
}

setupDatabase();
