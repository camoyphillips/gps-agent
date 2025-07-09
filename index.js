import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import gpsRoute from './gps.js';

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Setup Express
const app = express();
app.use(express.json());

// Static + view engine setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', './views');

// API routing
app.use('/api', gpsRoute);

// Optional: serve static homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ BIND TO 0.0.0.0 and use Render’s PORT
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ AI GPS Agent running at http://${HOST}:${PORT}`);
});
