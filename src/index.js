const fetchFauNews = require('./scraper');
const parseHeadlines = require('./parser');
const { writeToJson, writeToCsv } = require('./utils/fileWriter');

async function main() {
  try {
    console.log('Fetching FAU news...');
    const html = await fetchFauNews();
    
    console.log('Parsing headlines...');
    const headlines = await parseHeadlines(html); // Add await
    
    console.log(`Found ${headlines.length} headlines`);
    
    // Create an array of objects for JSON output
    const headlinesObj = headlines.map((item, index) => ({
      id: index + 1,
      headline: item.headline,
      content: item.content,
      link: item.link
    }));
    
    // Write to files
    await writeToJson(headlinesObj, 'fau-headlines.json');
    await writeToCsv(headlines, 'fau-headlines.csv');
    
    console.log('Scraping completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();