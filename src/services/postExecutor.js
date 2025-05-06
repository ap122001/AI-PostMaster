// src/services/postExecutor.js
const instagramService = require('./instagramService');
const twitterService = require('./twitterService');
const facebookService = require('./facebookService');
const logger = require('../utils/logger');

/**
 * Posts content to the specified social media platform
 * @param {string} platform - Supported platforms: 'instagram' | 'twitter' | 'facebook'
 * @param {object} content - Platform-specific content structure
 * @returns {object} - Post operation result
 */
async function postToPlatform(platform, content) {
  const platformName = platform.toLowerCase();
  logger.info(`🏁 Starting post to ${platformName}`, { content: sanitizeContent(content) });

  try {
    let result;
    
    switch(platformName) {
      case 'instagram':
        result = await handleInstagramPost(content);
        break;
        
      case 'twitter':
        result = await twitterService.post(content);
        break;
        
      case 'facebook':
        result = await facebookService.post(content);
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    logger.info(`✅ Successfully posted to ${platformName}`, {
      postId: result.postId,
      url: result.url
    });
    
    return result;

  } catch (error) {
    logger.error(`❌ Failed posting to ${platformName}`, {
      error: error.message,
      stack: error.stack,
      content: sanitizeContent(content)
    });
    throw new Error(`Platform post failed: ${error.message}`);
  }
}

// Instagram-specific handler with additional validation
async function handleInstagramPost(content) {
  if (!content.imageUrl && !content.carouselItems) {
    throw new Error('Instagram posts require either imageUrl or carouselItems');
  }
  
  return instagramService.post(content);
}

// Remove sensitive data from logs
function sanitizeContent(content) {
  return {
    ...content,
    imageUrl: content.imageUrl ? '[REDACTED_URL]' : undefined,
    carouselItems: content.carouselItems ? '[REDACTED_CAROUSEL]' : undefined,
    text: content.text ? content.text.substring(0, 50) + '...' : undefined
  };
}

module.exports = { postToPlatform };