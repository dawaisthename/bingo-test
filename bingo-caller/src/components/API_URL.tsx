import dotenv from 'dotenv';

// Initialize dotenv to load variables from .env
dotenv.config();

export const BACKEND_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
