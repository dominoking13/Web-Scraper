const fetchNews = require('./scraper');
const parseHeadlines = require('./parser');
const { writeToJson, writeToCsv } = require('./utils/fileWriter');
const sites = require('./config/sites');

async function main() {
  try {
    console.log('Starting multi-site news scraping...');

    // Process each site sequentially
    for (const site of sites) {
      try {
        console.log(`\n=== Processing ${site.name} ===`);
        console.log(`Fetching news from ${site.url}...`);

        const html = await fetchNews(site.url);

        console.log('Parsing headlines...');
        const headlines = await parseHeadlines(html, site);

        console.log(`Found ${headlines.length} headlines`);

        if (headlines.length > 0) {
          // Create an array of objects for JSON output
          const headlinesObj = headlines.map((item, index) => ({
            id: index + 1,
            headline: item.headline,
            content: item.content,
            link: item.link
          }));

          // Generate site-specific filenames
          const baseName = site.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const jsonFile = `${baseName}-headlines.json`;
          const csvFile = `${baseName}-headlines.csv`;

          // Write to files
          await writeToJson(headlinesObj, jsonFile);
          await writeToCsv(headlines, csvFile);

          console.log(`✅ ${site.name} scraping completed!`);
        } else {
          console.log(`⚠️ No headlines found for ${site.name}`);
        }

        // Add delay between sites to be respectful
        if (sites.indexOf(site) < sites.length - 1) {
          console.log('Waiting 2 seconds before next site...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (siteError) {
        console.error(`❌ Error processing ${site.name}:`, siteError.message);
        // Continue with next site instead of stopping completely
      }
    }

    console.log('\n🎉 All sites processed successfully!');
  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

main();