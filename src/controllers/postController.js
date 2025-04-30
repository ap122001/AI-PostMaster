const aiService = require('../services/aiService');
const scheduler = require('../services/schedulerService');
const logger = require('../utils/logger');
const postToPlatform = require('../services/postExecutor'); 


// exports.createPost = async (req, res, next) => {
//   try {
//     const { platform, prompt, scheduleTime } = req.body;
//     logger.info(`Incoming createPost: platform=${platform}, prompt="${prompt}", scheduleTime=${scheduleTime}`);
//     // 1. Generate content
//     const content = await aiService.generateText(prompt);
//     // 2. Schedule it
//     await scheduler.schedulePost({ platform, content, scheduleTime });
//     res.status(201).json({ status: 'scheduled', platform, scheduleTime });
//   } catch (err) {
//     next(err);
//   }
// };

exports.createPost = async (req, res, next) => {
    try {
        logger.info('🔥 TEST LOGGER WORKS 🔥');
      const { platform, prompt } = req.body;
      logger.info(`Incoming createPost: platform=${platform}, prompt="${prompt}"`);
      
      const content = await aiService.generateText(prompt);
      logger.info(`made the aiService.generateText call`);
    //   await postToPlatform(platform, content); 
  
      res.status(201).json({ status: 'posted', platform });
    } catch (err) {
      logger.error('❌ Error in createPost:', err);
      next(err);
    }
  };
  

exports.listPosts = async (req, res, next) => {
  try {
    const jobs = scheduler.listJobs();
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};
