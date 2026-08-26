const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServerInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/service_request_db';

  try {
    // Attempt standard connection with 3-second server selection timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to primary database at: ${primaryUri}`);
  } catch (err) {
    console.warn(`[MongoDB] Primary connection failed (${err.message}). Initializing embedded development MongoDB...`);
    try {
      mongoServerInstance = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 120000,
        },
      });
      const devUri = mongoServerInstance.getUri();
      await mongoose.connect(devUri);
      console.log(`[MongoDB] Connected successfully to Embedded MongoDB instance at: ${devUri}`);
    } catch (fallbackErr) {
      console.error('[MongoDB] Critical: Failed to establish any MongoDB connection:', fallbackErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServerInstance) {
      await mongoServerInstance.stop();
    }
  } catch (err) {
    console.error('[MongoDB] Error during disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
