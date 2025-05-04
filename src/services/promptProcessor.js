// services/promptProcessor.js
const logger = require('../utils/logger');

class PromptProcessor {
  static process(generatedText, imagePromptTemplate, pageTheme) {
    try {
      logger.info(`🔄 Processing prompt for theme: ${pageTheme}`);
      
      const processor = this.strategies[pageTheme] || this.defaultStrategy;
      const params = processor.extract(generatedText);
      
      return this.replacePlaceholders(imagePromptTemplate, params);
      
    } catch (err) {
      logger.error('❌ Prompt processing failed:', {
        error: err.message,
        theme: pageTheme,
        generatedText: generatedText?.substring(0, 50) + '...' // Safe handling
      });
      throw err;
    }
  }

  static replacePlaceholders(template, params) {
    return Object.entries(params).reduce((acc, [key, value]) => 
      acc.replace(new RegExp(`{${key}}|\\[${key}\\]`, 'gi'), value),
      template
    );
  }

  static strategies = {
    philosophy: {
      extract: (text) => {
        // Updated regex with unicode support and quote handling
        const match = text.match(
          /^([\p{L}\s']+):\s+"?((?:[^#"]|"|“|”)+)"?\s+(#\w+)\s+([^\s]+)/u
        );
        
        if (!match) {
          logger.error('Failed to parse philosophy text:', { text });
          throw new Error('Invalid philosophy text format');
        }

        return {
          'author': match[1].trim(),
          'quote': match[2].replace(/^"+|"+$/g, '').trim(), // Clean quotes
          'hashtag': match[3].trim(),
          'emoji': match[4].trim()
        };
      }
    },

    weather: {
      extract: (text) => {
        const match = text.match(
          /The current weather in (.+) is (\d+°C) with (.+)\./
        );
        if (!match) throw new Error('Invalid weather report format');
        
        return {
          'location': match[1],
          'temperature': match[2],
          'conditions': match[3]
        };
      }
    }
  };

  static defaultStrategy = {
    extract: (text) => {
      logger.warn('⚠️ Using default prompt processor');
      return { 'CONTENT': text };
    }
  };
}

module.exports = PromptProcessor;