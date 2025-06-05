require('dotenv').config();
const mongoose = require('mongoose');

const newDataBase = async () => {
  try {
    await mongoose.connect(process.env.mongoDB_Url);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

newDataBase();
