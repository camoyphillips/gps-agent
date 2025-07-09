// index.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import gpsRoute from './routes/gps.js';

dotenv.config();

// Check environment variables
if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH || !process.env.TWILIO_PHONE) {
  console.error('❌ Missing Twilio credentials in .env');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in .env');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();
app.use(express.json());

// Serve static HTML dashboard files from /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Set up Pug views
app.set('view engine', 'pug');
app.set('views', './views');

// Mount GPS route handlers
app.use('/api', gpsRoute);

// Optional: redirect root to HTML dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ AI GPS Agent running at http://localhost:${PORT}`);
});
