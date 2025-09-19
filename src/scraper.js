const axios = require('axios');

async function fetchNews(url) {
  try {
    const response = await axios.get(url);
    console.log(`Fetched ${url} successfully. Length: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

module.exports = fetchNews;