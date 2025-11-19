# FAU News Scraper

A comprehensive web scraper that fetches news headlines from multiple sources including Florida Atlantic University (FAU) Research news, FAU Academic & Campus Life, WPTV Local news, and weather data from AccuWeather. The scraper outputs clean, formatted data in both JSON and CSV formats.

## Features

- 📰 **Multi-source scraping**: Scrapes news from FAU Research, FAU Academic & Campus Life, and WPTV Local
- 🌤️ **Weather data**: Extracts current weather and daily forecasts from AccuWeather
- 📊 **Dual output formats**: Generates both JSON and CSV files for each data source
- 🧹 **Content cleaning**: Automatically removes HTML tags, JavaScript, and unwanted content
- ⚡ **Configurable limits**: Set custom headline limits per news source
- 🔄 **Automated scheduling**: GitHub Actions workflow for daily automated scraping
- 📁 **Organized output**: Separate files for each data source in dedicated output directory
- 🚀 **Smart caching**: Avoids re-scraping unchanged content using SHA-256 hashing

## Project Structure

```
fau-news-scraper/
├── src/
│   ├── index.js              # Main application entry point - orchestrates multi-site scraping
│   ├── scraper.js            # HTTP client for fetching web content from configured URLs
│   ├── parser.js             # HTML parsing and content extraction with cleaning functions
│   ├── config/
│   │   └── sites.js          # Configuration file defining news sources, selectors, and limits
│   └── utils/
│       ├── fileWriter.js     # Utility functions for writing JSON/CSV output files
│       ├── logger.js         # Logging utilities for debugging and monitoring
│       └── contentCache.js   # Content caching utility to avoid re-scraping unchanged pages
├── .cache/                   # Cache directory for storing content hashes (ignored by Git)
│   └── content-hashes.json   # SHA-256 hashes of previously scraped content
├── output/                   # Generated output files directory
│   ├── fau-headlines.json    # FAU Research news headlines (JSON format)
│   ├── fau-headlines.csv     # FAU Research news headlines (CSV format)
│   ├── fau-academic-campus-life-headlines.json  # FAU Academic & Campus Life headlines (JSON format)
│   ├── fau-academic-campus-life-headlines.csv   # FAU Academic & Campus Life headlines (CSV format)
│   ├── wptv-local-headlines.json    # WPTV Local news headlines (JSON format)
│   ├── wptv-local-headlines.csv     # WPTV Local news headlines (CSV format)
│   ├── accuweather-boca-raton-weather.json  # AccuWeather Boca Raton weather data (JSON format)
│   ├── accuweather-boca-raton-weather.csv   # AccuWeather Boca Raton weather data (CSV format)
│   └── .gitkeep              # Keeps output directory tracked by Git
├── .github/
│   └── workflows/
│       ├── daily-scrape.yml  # GitHub Actions workflow for automated daily scraping
│       └── upload-to-s3.yml  # GitHub Actions workflow for S3 uploads
├── package.json              # Project dependencies and npm scripts
├── .gitignore                # Files and directories to ignore by Git
└── README.md                 # This documentation file
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dominoking13/Web-Scraper.git
   cd fau-news-scraper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Manual Execution

Run the scraper manually:
```bash
npm start
# or
node src/index.js
```

This will:
- Check cached content hashes to avoid re-scraping unchanged pages
- Scrape only sites with new or updated content
- Generate clean output files in the `output/` directory
- Update content hashes for future runs
- Display progress and results in the console (including cache hits/skips)

### Selective Site Scraping

Run the scraper for specific sites only:
```bash
# Run only FAU Research
npm start -- fau-research

# Run only WPTV Local
npm start -- wptv-local

# Run only Boca Current Affairs
npm start -- boca-current-affairs

# Run multiple sites (space-separated)
npm start -- fau-research wptv-local boca-current-affairs
```

This is useful for:
- Testing specific sites during development
- Running targeted updates for particular sources
- Faster execution when you only need certain data

### Automated Execution

The project includes GitHub Actions automation that runs daily at 5:00 AM EST:

- Located in `.github/workflows/daily-scrape.yml`
- Automatically commits and pushes updated output files
- Runs on schedule and can be triggered manually

### S3 Upload Automation

The project includes automatic upload of CSV and JSON files to an S3 bucket:

- Located in `.github/workflows/upload-to-s3.yml`
- Triggers on pushes to main branch when output files change
- Uploads all `.csv` and `.json` files from the `output/` directory
- Can be triggered manually via GitHub Actions

#### S3 Setup Requirements

1. **Create S3 Bucket**: Create a bucket named `radio-scripts` in your AWS account
2. **Configure AWS Credentials**: Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
   - `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
3. **Set Bucket Permissions**: Ensure your AWS credentials have `s3:PutObject` permissions for the `radio-scripts` bucket

#### Repository Secrets Setup

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
#### Testing S3 Uploads

Use the included test script to verify S3 upload functionality locally:

```bash
./test-s3-upload.sh
```

This script will:
- Check AWS CLI installation and configuration
- List files that would be uploaded
- Provide commands for manual S3 uploads

## Weather Data

The scraper includes weather data extraction from AccuWeather for Boca Raton, FL:

- **Current Weather**: Temperature, conditions, and timestamp
- **Today's Forecast**: High and low temperatures
- **Output Files**: `accuweather-boca-raton-weather.json` and `accuweather-boca-raton-weather.csv`

**Note**: Due to AccuWeather's dynamic content loading, only current and today's weather data are available. Extended forecasts require JavaScript execution or API access.

## Configuration

### Adding New News Sources

Edit `src/config/sites.js` to add new news sources:

```javascript
const sites = [
  {
    name: 'example-site',
    url: 'https://example.com/news',
    selectors: {
      headline: 'h2.article-title',
      content: 'div.article-content',
      link: 'h2.article-title a'
    },
    limit: 10  // Optional: limit number of headlines
  }
];
```

### Adjusting Headline Limits

Modify the `limit` property in `src/config/sites.js`:
- Remove the `limit` property to scrape all available headlines
- Set `limit: N` to scrape only the first N headlines

## Caching System

The scraper uses intelligent caching to avoid unnecessary HTTP requests and processing:

### How It Works
- **SHA-256 Hashing**: Generates content hashes for each webpage
- **Change Detection**: Compares current content hash with cached hash
- **Smart Skipping**: Skips scraping when content hasn't changed
- **Automatic Updates**: Updates cache after successful scraping

### Cache Location
- Cache files are stored in `.cache/content-hashes.json`
- Cache directory is excluded from Git (added to `.gitignore`)
- Cache persists between runs for optimal performance

### Cache Benefits
- ⚡ **Faster execution**: Skip unchanged sites in seconds
- 📉 **Reduced bandwidth**: Avoid unnecessary HTTP requests
- 🔄 **Efficient automation**: Daily runs only process changes
- 📊 **Detailed reporting**: Console shows processed vs skipped sites

## Output Files

Each news source generates two output files:

### JSON Format (`*-headlines.json`)
```json
[
  {
    "id": 1,
    "headline": "Article Headline",
    "content": "Full article content with HTML cleaned...",
    "link": "https://source.com/article-url"
  }
]
```

### CSV Format (`*-headlines.csv`)
```csv
"Article Headline","Full article content...","https://source.com/article-url"
```

## Dependencies

- **axios**: HTTP client for fetching web content
- **cheerio**: jQuery-like library for HTML parsing
- **fs-extra**: Enhanced file system operations
- **crypto**: Built-in Node.js module for SHA-256 content hashing

## Development

### Code Quality

- Modular architecture with separation of concerns
- Comprehensive error handling
- Respectful scraping with delays between requests
- Content cleaning to remove unwanted HTML/JavaScript

### Adding New Features

1. **New scraper functionality**: Add to `src/scraper.js`
2. **New parsing logic**: Modify `src/parser.js`
3. **New output formats**: Extend `src/utils/fileWriter.js`
4. **New news sources**: Update `src/config/sites.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please respect the terms of service of the websites being scraped and use responsibly.

## Troubleshooting

### Common Issues

- **Empty output files**: Check if website structure has changed - update selectors in `sites.js`
- **Network errors**: Verify internet connection and website availability
- **Permission errors**: Ensure write permissions for the `output/` directory

### Debug Mode

Add console logging to see detailed scraping progress:
```javascript
console.log('Scraping progress...');
```

## Future Enhancements

- [ ] Add more news sources
- [x] Implement caching to avoid re-scraping unchanged content
- [ ] Add web interface for configuration
- [ ] Support for additional output formats (XML, RSS)
- [ ] Email notifications for new headlines

This project is licensed under the MIT License.