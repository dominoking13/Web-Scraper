const fetchNews = require('./scraper');
const parseHeadlines = require('./parser');
const { writeToJson, writeToCsv } = require('./utils/fileWriter');
const ContentCache = require('./utils/contentCache');
const sites = require('./config/sites');

async function main() {
  try {
    console.log('🚀 Starting multi-site news scraping with caching...');

    // Initialize content cache
    const cache = new ContentCache();
    await cache.init();

    let sitesProcessed = 0;
    let sitesSkipped = 0;

    // Process each site sequentially
    for (const site of sites) {
      try {
        console.log(`\n=== Processing ${site.name} ===`);
        console.log(`Fetching news from ${site.url}...`);

        const html = await fetchNews(site.url);

        // Check if content has changed using cache
        const contentChanged = await cache.hasContentChanged(site.name, html);

        if (!contentChanged) {
          console.log(`⏭️  ${site.name} content unchanged - skipping scrape`);
          sitesSkipped++;
        } else {
          console.log(`📝 ${site.name} content changed - processing...`);

          console.log('Parsing content...');
          const content = await parseHeadlines(html, site);

          console.log(`Found ${content.length} items`);

          if (content.length > 0) {
            let outputData;
            let jsonFile, csvFile;

            if (site.type === 'weather') {
              // Handle weather data
              outputData = content.map((item, index) => ({
                id: index + 1,
                ...item
              }));

              // Generate weather-specific filenames
              const baseName = site.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              jsonFile = `${baseName}-weather.json`;
              csvFile = `${baseName}-weather.csv`;

              // For CSV, flatten weather data
              const csvData = content.map(item => ({
                type: item.type,
                temperature: item.temperature || '',
                condition: item.condition || '',
                high: item.high || '',
                low: item.low || '',
                realFeel: item.realFeel || '',
                wind: item.wind || '',
                precipitation: item.precipitation || '',
                day: item.day || '',
                date: item.date || '',
                timestamp: item.timestamp || ''
              }));

              await writeToJson(outputData, jsonFile);
              await writeToCsv(csvData, csvFile);
            } else {
              // Handle news headlines
              outputData = content.map((item, index) => ({
                id: index + 1,
                headline: item.headline,
                content: item.content,
                link: item.link
              }));

              // Generate site-specific filenames
              const baseName = site.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              jsonFile = `${baseName}-headlines.json`;
              csvFile = `${baseName}-headlines.csv`;

              // Write to files
              await writeToJson(outputData, jsonFile);
              await writeToCsv(content, csvFile);
            }

            // Update cache with new content
            await cache.updateCache(site.name, html);

            console.log(`✅ ${site.name} scraping completed!`);
            sitesProcessed++;
          } else {
            console.log(`⚠️ No content found for ${site.name}`);
          }
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

    // Summary
    console.log('\n📊 Scraping Summary:');
    console.log(`   Sites processed: ${sitesProcessed}`);
    console.log(`   Sites skipped (cached): ${sitesSkipped}`);
    console.log(`   Total sites: ${sites.length}`);

    if (sitesProcessed > 0) {
      console.log('\n🎉 Scraping completed with updates!');
    } else {
      console.log('\n🤖 All sites had unchanged content - no updates needed');
    }

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

main();