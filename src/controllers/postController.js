const aiService = require('../services/aiService');
const scheduler = require('../services/schedulerService');
const logger = require('../utils/logger');
const { postToPlatform } = require('../services/postExecutor');
const textPrompts = require('../prompts/textGeneration.json');
const imagePrompts = require('../prompts/imageGeneration.json');
const PromptProcessor = require('../services/promptProcessor'); // Added import

exports.createPost = async (req, res, next) => {
  try {
    logger.info('🔥 CreatePost initiated', {
      body: req.body,
      availablePrompts: Object.keys(textPrompts)
    });
    
    const { platform, pageTheme } = req.body;

    // 1. Validate and get prompts
    const selectedPrompt = textPrompts[pageTheme]?.prompt;
    const imagePromptTemplate = imagePrompts[pageTheme]?.prompt;

    if (!selectedPrompt) {
      throw new Error(`No text prompt found for theme: ${pageTheme}`);
    }
    if (!imagePromptTemplate) {
      throw new Error(`No image prompt found for theme: ${pageTheme}`);
    }

    logger.info(`Selected prompts for "${pageTheme}":`, {
      textPrompt: selectedPrompt.substring(0, 50) + '...',
      imagePrompt: imagePromptTemplate.substring(0, 50) + '...'
    });

    // 2. Generate text content
    const content = await aiService.generateText(selectedPrompt);
    if (typeof content !== 'string') {
      throw new Error('AI service returned invalid content format');
    }

    logger.info('📦 Generated content:', {
      contentPreview: content.substring(0, 100) + '...',
      contentLength: content.length
    });

    // 3. Process and generate image
    const processedImagePrompt = PromptProcessor.process(
      content,
      imagePromptTemplate,
      pageTheme
    );
    
    logger.info('🖌️ Processed image prompt:', {
      // preview: processedImagePrompt.substring(0, 100) + '...'
      preview: processedImagePrompt
    });

    const imageUrl = await aiService.generateImage(processedImagePrompt);

    // 4. Post to platform
    await postToPlatform(platform, { content, imageUrl });
    
    res.status(201).json({
      status: 'posted',
      platform,
      theme: pageTheme,
      contentPreview: content.substring(0, 50) + '...',
      imageUrl: imageUrl // Added image URL to response
    });

  } catch (err) {
    logger.error('❌ Error in createPost:', {
      error: err.message,
      stack: err.stack
    });
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