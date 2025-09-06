// src/lib/db.ts
import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const conn = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default conn;