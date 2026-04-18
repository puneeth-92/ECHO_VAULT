import mongoose from 'mongoose';

const accessSchema = new mongoose.Schema({
  token: { type: String, unique: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  expiryTime: Date,
  maxDownloads: Number,
  currentDownloads: { type: Number, default: 0 },
  passwordHash: String
});

export default mongoose.model('Access', accessSchema);