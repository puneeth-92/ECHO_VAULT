import mongoose from 'mongoose';
const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  public_id: String,
  size: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('File', fileSchema);