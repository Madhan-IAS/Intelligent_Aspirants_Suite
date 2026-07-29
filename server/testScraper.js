require('dotenv').config();
const mongoose = require('mongoose');
const { runScraper } = require('./workers/currentAffairsScraper');
const CurrentAffair = require('./models/CurrentAffair');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/upsc-kms';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB. Clearing existing Current Affairs for clean test...');
    await CurrentAffair.deleteMany({});
    console.log('Starting manual scraper test...');
    await runScraper();
    console.log('Test complete. Disconnecting...');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('DB Connection error:', err);
  });
