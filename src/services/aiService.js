const axios = require('axios');
// const { openaiKey } = require('../config');
const config = require('config');
// const openai = require('../utils/openai');
const logger = require('../utils/logger');
// const OpenAI = require(openai);
const openai = require('../utils/openai');

exports.generateText = async (prompt) => {
    logger.info('---->logging befor AI call');

    const response = await openai.chat.completions.create({
        model: config.get('openai.model'),  // You can use 'gpt-3.5-turbo' or other models
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
      });
//   const resp = await axios.post(`https://api.openai.com/v1/completions`, {
//     model: config.get('openai.model'),
//     prompt,
//     max_tokens: 150,
//   }, {
//     headers: { Authorization: `Bearer ${config.get('openai.apiKey')}` }
//   });
// logger.info(`AI response: ${JSON.stringify(response, null, 2)}`);
  logger.info(`AI response-> ${JSON.stringify(response.choices.message)}`);
  return response;
};
