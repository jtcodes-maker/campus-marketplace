const express = require('express');
const cors = require('cors');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Add Mongoose

// Load environment variables from the .env file
dotenv.config();

// Initialize the Express application
const app = express();
app.use(cors());

// Middleware
app.use(cors()); 
app.use(express.json()); 

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const listingRoutes = require('./routes/listingRoutes');
app.use('/api/listings', listingRoutes);

const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
  });

// A simple test route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Campus Marketplace API is running smoothly!' });
});

// Set the port and start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});