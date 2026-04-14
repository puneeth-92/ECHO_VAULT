import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use('/api', fileRoutes);

// test route
app.get('/', (req, res) => {
  res.send('ECO_VAULT API running');
});

// DB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running...');
    });
  })
  .catch(err => console.log(err));