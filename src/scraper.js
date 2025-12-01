const axios = require('axios');
const robotsParser = require('robots-parser');

async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL(url).origin + '/robots.txt';
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    const robots = robotsParser(robotsUrl, response.data);
    const isAllowed = robots.isAllowed(url, 'fau-news-scraper/1.0');
    console.log(`Robots.txt check for ${url}: ${isAllowed ? 'ALLOWED' : 'BLOCKED'}`);
    return isAllowed;
  } catch (error) {
    // If robots.txt doesn't exist or can't be fetched, assume allowed
    console.log(`Robots.txt not found or error for ${url}, assuming allowed`);
    return true;
  }
}

async function fetchNews(url) {
  try {
    // Check robots.txt before fetching
    const robotsAllowed = await checkRobotsTxt(url);
    if (!robotsAllowed) {
      console.log(`❌ Blocked by robots.txt: ${url}`);
      throw new Error(`Access blocked by robots.txt for ${url}`);
    }
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 30000 // 30 second timeout
    };

    const response = await axios.get(url, config);
    console.log(`Fetched ${url} successfully. Length: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

module.exports = fetchNews;