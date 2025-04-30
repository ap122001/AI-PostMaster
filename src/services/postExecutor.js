// src/services/postExecutor.js

const instagramService = require('./instagramService');
const twitterService   = require('./twitterService');
const facebookService  = require('./facebookService.js');

const platformMap = {
  instagram: instagramService,
  twitter:   twitterService,
  facebook:  facebookService,
};

/**
 * Posts `content` to the given `platform`.
 * @param {string} platform – one of 'instagram' | 'twitter' | 'facebook'
 * @param {string} content
 */
async function postToPlatform(platform, content) {
  const svc = platformMap[platform];
  if (!svc) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return svc.post(content);
}

module.exports = { postToPlatform };
