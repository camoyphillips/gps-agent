import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDistance } from 'geolib';
import { sendSMS, makeCall } from '../services/twilioAgent.js';
import Log from '../models/log.js';

const router = express.Router();

// Support __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load zones.json
let zones = [];
try {
  const data = await fs.readFile(path.join(__dirname, '../data/zones.json'), 'utf-8');
  zones = JSON.parse(data);
} catch (err) {
  console.error('❌ Failed to load zones.json:', err);
}

// ✅ Test route
router.get('/test', (req, res) => {
  res.json({ message: 'GPS Agent is alive' });
});

// ✅ JSON logs endpoint
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs', details: err.message });
  }
});

// ✅ Pug dashboard with search, filter, pagination
router.get('/view/logs', async (req, res) => {
  try {
    const { phone, zone, page = 1 } = req.query;
    const filter = {};

    if (phone) filter.phone = { $regex: phone, $options: 'i' };
    if (zone) filter.zoneName = zone;

    const perPage = 10;
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const total = await Log.countDocuments(filter);
    const totalPages = Math.ceil(total / perPage);
    const zones = await Log.distinct('zoneName');

    res.render('logs', {
      logs,
      currentPage: Number(page),
      totalPages,
      phone,
      zone,
      zones
    });
  } catch (err) {
    res.status(500).send('Failed to load logs');
  }
});

// ✅ Location handler
router.post('/location', async (req, res) => {
  const { lat, lng, phone } = req.body;

  if (!lat || !lng || !phone) {
    return res.status(400).json({ error: 'lat, lng, and phone are required' });
  }

  const logEntry = new Log({
    lat,
    lng,
    phone,
    zoneName: 'No zone triggered',
    action: 'none',
    triggered: false
  });

  for (const zone of zones) {
    const dist = getDistance({ latitude: lat, longitude: lng }, { latitude: zone.lat, longitude: zone.lng });

    if (dist <= zone.radius) {
      logEntry.zoneName = zone.name;
      logEntry.action = zone.action;
      logEntry.triggered = true;

      try {
        if (zone.action === 'sms') {
          await sendSMS(phone, zone.message || `You entered ${zone.name}`);
          await logEntry.save();
          return res.json({ status: 'SMS sent', location: zone.name });
        } else if (zone.action === 'call') {
          await makeCall(phone);
          await logEntry.save();
          return res.json({ status: 'Call initiated', location: zone.name });
        }
      } catch (err) {
        await logEntry.save();
        return res.status(500).json({ error: 'Failed to perform action', details: err.message });
      }
    }
  }

  await logEntry.save();
  res.json({ status: 'No action triggered' });
});

export default router;