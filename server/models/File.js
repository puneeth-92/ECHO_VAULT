import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  size: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('File', fileSchema);