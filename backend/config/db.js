const mongoose = require('mongoose');

let isInMemoryFallback = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmind_ai', {
      serverSelectionTimeoutMS: 2500 // Quick timeout if local MongoDB daemon is not running
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn(`⚡ Switching to TaskMind AI In-Memory Smart Data Store mode (No local MongoDB service required).`);
    isInMemoryFallback = true;
  }
};

const getIsInMemoryFallback = () => isInMemoryFallback;

module.exports = { connectDB, getIsInMemoryFallback };
