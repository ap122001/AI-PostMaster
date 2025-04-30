const { schedulePost } = require('../services/schedulerService');

exports.scheduleAllJobs = () => {
  // e.g., every day at 9am
  schedulePost({
    platform: 'instagram',
    prompt: 'Good morning! ☀️',
    scheduleTime: '12 4 * * *',
  });
};
