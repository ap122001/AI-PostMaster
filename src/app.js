const express = require('express');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { rehydrateAllJobs } = require('./services/schedulerService');

const app = express();
app.use(express.json());

// Mount API routes
app.use('/api/posts', postRoutes);

// Global error handler
app.use(errorHandler);

// Rehydrate scheduled jobs from Redis on startup
(async () => {
  try {
    await rehydrateAllJobs();
    console.log('✅ Rehydrated scheduled jobs from Redis');
  } catch (err) {
    console.error('❌ Failed to rehydrate jobs:', err);
  }
})();

module.exports = app;
