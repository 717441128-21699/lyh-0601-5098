require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbConnected = false;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pet-training', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000,
}).then(() => {
  dbConnected = true;
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('MongoDB not available, running with mock data only');
  dbConnected = false;
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.log('MongoDB connection error, running with mock data');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pet Training API is running' });
});

app.use('/api/pets', require('./routes/pets'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
