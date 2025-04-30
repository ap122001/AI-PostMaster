const cron = require('node-cron');
const { createClient } = require('redis');
const { postToPlatform } = require('./postExecutor');
const { redisUrl } = require('../config');

// Initialize Redis client
const redis = createClient({ url: redisUrl });
redis.connect().catch(err => console.error('Redis connection error:', err));

// Prefix for Redis keys storing job metadata
const TASK_PREFIX = 'scheduler:job:';

/**
 * Convert scheduleTime into a cron expression.
 * Accepts either a cron string or an ISO timestamp.
 */
function toCronExpr(scheduleTime) {
  if (typeof scheduleTime === 'string' && scheduleTime.trim().includes(' ')) {
    return scheduleTime; // assume cron format
  }
  // Parse ISO datetime and build a one-off cron expression
  const date = new Date(scheduleTime);
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  return `${minute} ${hour} ${day} ${month} *`;
}

/**
 * Schedule a post and persist its metadata in Redis.
 * @param {{platform: string, prompt: string, scheduleTime: string}} options
 * @returns {Promise<string>} The generated job name
 */
async function schedulePost({ platform, prompt, scheduleTime }) {
  const cronExpr = toCronExpr(scheduleTime);
  const name = `${platform}-${Date.now()}`;

  // Schedule the cron task
  cron.schedule(cronExpr, () => {
    postToPlatform(platform, prompt);
    // Cleanup one-off tasks scheduled by ISO timestamps
    if (!scheduleTime.includes(' ')) {
      cancelJob(name);
    }
  }, { name });

  // Persist job metadata
  const jobData = JSON.stringify({ platform, prompt, scheduleTime, cronExpr });
  await redis.set(TASK_PREFIX + name, jobData);

  return name;
}

/**
 * List all scheduled jobs by reading Redis.
 * @returns {Promise<Array<{name: string, platform: string, prompt: string, scheduleTime: string, cronExpr: string}>>}
 */
async function listJobs() {
  const keys = await redis.keys(TASK_PREFIX + '*');
  if (keys.length === 0) return [];

  const pipeline = redis.multi();
  keys.forEach(key => pipeline.get(key));
  const results = await pipeline.exec();

  return keys.map((key, idx) => {
    const name = key.replace(TASK_PREFIX, '');
    const { platform, prompt, scheduleTime, cronExpr } = JSON.parse(results[idx]);
    return { name, platform, prompt, scheduleTime, cronExpr };
  });
}

/**
 * Cancel a scheduled job by stopping its cron task and removing its Redis key.
 * @param {string} name
 */
async function cancelJob(name) {
  const key = TASK_PREFIX + name;
  const task = cron.getTasks()[name];
  if (task) task.stop();
  await redis.del(key);
}

/**
 * Rehydrate all persisted jobs into active cron schedules on startup.
 */
async function rehydrateAllJobs() {
  const jobs = await listJobs();
  jobs.forEach(({ name, prompt, platform, cronExpr, scheduleTime }) => {
    cron.schedule(cronExpr, () => {
      postToPlatform(platform, prompt);
      if (!scheduleTime.includes(' ')) cancelJob(name);
    }, { name });
  });
}

module.exports = {
  schedulePost,
  listJobs,
  cancelJob,
  rehydrateAllJobs,
};
