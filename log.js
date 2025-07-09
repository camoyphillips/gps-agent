// models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  phone: String,
  zoneName: { type: String, default: 'No zone triggered' },
  action: { type: String, default: 'none' },
  triggered: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Log', logSchema);