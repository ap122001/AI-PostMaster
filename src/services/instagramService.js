// src/services/instagramService.js
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('config');
const  IG_USER_ID = config.instagram.ig_user_id;
const  INSTAGRAM_ACCESS_TOKEN = config.instagram.access_token;
const API_VERSION = config.instagram.api_version;
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${IG_USER_ID}`;

const DEFAULT_HEADERS = {
  Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

async function handleInstagramAPI(endpoint, data, method = 'POST') {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}/${endpoint}`,
      headers: DEFAULT_HEADERS,
      data
    });

    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return response.data;
  } catch (error) {
    logger.error('Instagram API Request Failed:', {
      endpoint,
      error: error.response?.data?.error || error.message
    });
    throw new Error(`Instagram API call failed: ${error.message}`);
  }
}

async function checkContainerStatus(containerId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/media?fields=status_code,status&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      { params: { container_id: containerId } }
    );

    const status = response.data.data[0]?.status_code;
    if (!status) throw new Error('Invalid container status response');
    
    return {
      status: status.toUpperCase(),
      message: response.data.data[0]?.status
    };
  } catch (error) {
    logger.error('Container Status Check Failed:', { containerId, error: error.message });
    throw error;
  }
}

async function waitForContainerReady(containerId, retries = 5, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { status } = await checkContainerStatus(containerId);
    
    if (status === 'FINISHED') return true;
    if (status === 'ERROR') throw new Error('Media processing failed');
    
    await new Promise(resolve => setTimeout(resolve, delay * attempt));
  }
  throw new Error('Media processing timeout');
}

async function createMediaContainer(params) {
  const requiredFields = ['caption', 'image_url', 'media_type'];
  const missing = requiredFields.filter(field => !params[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const payload = {
    ...params,
    is_carousel_item: params.is_carousel_item || false
  };

  const data = await handleInstagramAPI('media', payload);
  return data.id; // Returns container ID
}

async function createSingleImage(content) {
  const { imageUrl, caption } = content;
  
  if (!imageUrl.startsWith('https://')) {
    throw new Error('Image URL must use HTTPS protocol');
  }

  const containerId = await createMediaContainer({
    image_url: imageUrl,
    caption: caption.substring(0, 2200), // Truncate to max caption length
    media_type: 'IMAGE'
  });

  await waitForContainerReady(containerId);
  return containerId;
}

async function createCarouselContainer(children, caption = '') {
  if (!Array.isArray(children) || children.length < 2 || children.length > 10) {
    throw new Error('Carousel requires 2-10 media items');
  }

  const carouselChildren = await Promise.all(
    children.map(async (child, index) => ({
      media_type: 'IMAGE',
      is_carousel_item: true,
      image_url: child.imageUrl,
      caption: child.caption || '',
      position: index
    }))
  );

  const containerId = await createMediaContainer({
    media_type: 'CAROUSEL',
    caption: caption.substring(0, 2200),
    children: carouselChildren.map(c => c.id)
  });

  await waitForContainerReady(containerId);
  return containerId;
}

async function publishContainer(containerId) {
  try {
    const result = await handleInstagramAPI('media_publish', { creation_id: containerId });
    return {
      id: result.id,
      url: `https://www.instagram.com/p/${result.id}/`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Publishing Failed:', { containerId, error: error.message });
    throw new Error('Failed to publish Instagram post');
  }
}

module.exports = {
  post: async (content) => {
    try {
      let containerId;
      
      if (content.carouselItems) {
        containerId = await createCarouselContainer(content.carouselItems, content.caption);
      } else {
        containerId = await createSingleImage(content);
      }

      const publishResult = await publishContainer(containerId);
      return {
        success: true,
        postId: publishResult.id,
        url: publishResult.url
      };
    } catch (error) {
      logger.error('Instagram Post Failed:', {
        content: content.caption?.substring(0, 50),
        error: error.message
      });
      throw error;
    }
  },

  // Expose individual methods for advanced usage
  createMediaContainer,
  createSingleImage,
  createCarouselContainer,
  publishContainer
};