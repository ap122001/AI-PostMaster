const { OpenAI } = require("openai");
const config = require("config");

const openai = new OpenAI({
  apiKey: config.get('openai.apiKey'),
});

module.exports = openai;
