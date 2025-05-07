const axios = require('axios');
// const { openaiKey } = require('../config');
const config = require('config');
// const openai = require('../utils/openai');
const logger = require('../utils/logger');
// const OpenAI = require(openai);
const openai = require('../utils/openai');

exports.generateText = async (prompt) => {
  try {
      logger.info('🤖 Starting AI text generation');
      
      const response = await openai.chat.completions.create({
          model: config.get('openai.model'),
          messages: [
              { role: 'system', content: 'You are a social media content generator' },
              { role: 'user', content: prompt }
          ],
      });

      // Properly extract content
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
          throw new Error('Empty response from OpenAI API');
      }

      logger.info('✅ AI generation successful', {
          contentPreview: content.substring(0, 50) + '...',
          tokenUsage: response.usage
      });

      return content; // Return just the text content

  } catch (err) {
      logger.error('❌ AI generation failed', {
          error: err.message,
          promptPreview: prompt.substring(0, 50) + '...'
      });
      throw err; // Re-throw for controller handling
  }
};

exports.generateImage = async (prompt) => {
  try {
      logger.info('🎨 Starting AI image generation');

    //   const response = await openai.images.generate({
    //     model: config.get('openai.imageModel'), // e.g., "dall-e-3"
    //     prompt: prompt,
    //     size: "1024x1792", // Instagram portrait
    //     quality: "standard",
    //     style: "natural", // or "vivid"
    // });

    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.get('openai.apiKey')}`
        },
        body: JSON.stringify({
          model: config.get('openai.imageModel'),
          prompt: prompt,
          size: "1024x1792",
          quality: "standard"
        })
      });
      
      const imageUrl = response && response.data ? response.data[0]?.url : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example.jpg/800px-Example.jpg";
      
      if (!imageUrl) {
          throw new Error('Empty response from OpenAI image API');
      }

      logger.info('🖼️ AI image generated', {
          promptPreview: prompt.substring(0, 50) + '...',
          imageUrl: imageUrl // Log truncated if sensitive
      });

      return imageUrl;

  } catch (err) {
      logger.error('❌ AI image generation failed', {
          error: err.message,
          promptPreview: prompt.substring(0, 50) + '...'
      });
      throw err;
  }
};