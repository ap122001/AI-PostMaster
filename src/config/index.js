module.exports = {
    openaiKey:   process.env.OPENAI_API_KEY,
    model: process.env.MODEL,
    igToken:     process.env.IG_ACCESS_TOKEN,
    twCredentials: {
      consumerKey:    process.env.TW_CONSUMER_KEY,
      consumerSecret: process.env.TW_CONSUMER_SECRET,
      accessToken:    process.env.TW_ACCESS_TOKEN,
      accessSecret:   process.env.TW_ACCESS_SECRET,
    },
    fbPageToken: process.env.FB_PAGE_TOKEN,
    redisUrl: process.env.REDIS_URL,
  };
